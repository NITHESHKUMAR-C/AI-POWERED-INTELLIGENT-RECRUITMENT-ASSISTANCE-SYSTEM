"""
Analysis Router
Triggers AI evaluation matching between candidates and jobs, computing semantic similarity,
skill coverage, explainable SHAP/LIME factors, and upskilling recommendations.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.db_models import Job, Candidate, Resume, Evaluation, SkillRecommendation
from models.schemas import AnalyzeRequest, EvaluationResult, SkillRecommendationSchema
from services.matching_service import calculate_candidate_match
from services.evaluation_service import evaluate_candidate_for_job
from services.recommendation_service import generate_skill_recommendations
from services.explanation_service import generate_explainability_report

router = APIRouter(prefix="/analyze", tags=["Analysis"])

@router.post("", response_model=List[EvaluationResult], status_code=status.HTTP_200_OK)
def analyze_candidates_for_job(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Executes AI matching analysis between candidates and a specified job.
    Computes semantic similarity embeddings, skill match scores, status recommendations,
    explainability breakdowns, and targeted skill development roadmaps.
    """
    job = db.query(Job).filter(Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {request.job_id} not found.")

    cand_query = db.query(Candidate)
    if request.candidate_ids:
        cand_query = cand_query.filter(Candidate.id.in_(request.candidate_ids))

    candidates = cand_query.all()
    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates found for analysis.")

    results: List[EvaluationResult] = []

    for cand in candidates:
        # Retrieve resume text
        resume = db.query(Resume).filter(Resume.candidate_id == cand.id).order_by(Resume.uploaded_at.desc()).first()
        resume_text = resume.raw_text if resume else f"Candidate: {cand.name}. Experience: {cand.experience_years} years. Education: {cand.education}"

        # Retrieve candidate skills
        candidate_skills = [s.skill_name for s in cand.skills]

        # 1. Matching calculation
        match_data = calculate_candidate_match(
            job_description=job.description,
            job_required_skills=job.required_skills or [],
            job_experience_required=job.experience_required or 0,
            candidate_resume_text=resume_text,
            candidate_skills=candidate_skills,
            candidate_experience_years=float(cand.experience_years or 0.0),
            candidate_education=cand.education or ""
        )

        # 2. Evaluation status & reason
        eval_data = evaluate_candidate_for_job(
            candidate_name=cand.name,
            job_title=job.title,
            job_experience_required=job.experience_required or 0,
            candidate_experience_years=float(cand.experience_years or 0.0),
            match_data=match_data
        )

        # 3. Explainability report (SHAP/LIME factors)
        shap_report = generate_explainability_report(
            match_data=match_data,
            candidate_name=cand.name,
            job_title=job.title
        )

        # 4. Check if existing evaluation exists for this job & candidate
        evaluation = db.query(Evaluation).filter(
            Evaluation.job_id == job.id,
            Evaluation.candidate_id == cand.id
        ).first()

        if not evaluation:
            evaluation = Evaluation(job_id=job.id, candidate_id=cand.id)
            db.add(evaluation)

        evaluation.match_percentage = match_data["match_percentage"]
        evaluation.semantic_similarity = match_data["semantic_similarity"]
        evaluation.skill_match_score = match_data["skill_match_score"]
        evaluation.matching_skills = match_data["matching_skills"]
        evaluation.missing_skills = match_data["missing_skills"]
        evaluation.status = eval_data["status"]
        evaluation.ai_summary = eval_data["ai_summary"]
        evaluation.evaluation_reason = eval_data["evaluation_reason"]
        evaluation.shap_explanation = shap_report

        db.flush()

        # 5. Clear old recommendations for this evaluation and regenerate
        db.query(SkillRecommendation).filter(SkillRecommendation.evaluation_id == evaluation.id).delete()
        recommendations = generate_skill_recommendations(match_data["missing_skills"])
        rec_schemas = []
        for rec in recommendations:
            rec_obj = SkillRecommendation(
                evaluation_id=evaluation.id,
                skill_name=rec["skill_name"],
                priority=rec["priority"],
                recommended_action=rec["recommended_action"],
                learning_resource_title=rec["learning_resource_title"],
                learning_provider=rec["learning_provider"]
            )
            db.add(rec_obj)
            rec_schemas.append(SkillRecommendationSchema(**rec))

        db.commit()

        results.append(
            EvaluationResult(
                id=evaluation.id,
                job_id=job.id,
                job_title=job.title,
                candidate_id=cand.id,
                candidate_name=cand.name,
                match_percentage=float(evaluation.match_percentage),
                semantic_similarity=float(evaluation.semantic_similarity),
                skill_match_score=float(evaluation.skill_match_score),
                matching_skills=evaluation.matching_skills,
                missing_skills=evaluation.missing_skills,
                status=evaluation.status,
                ai_summary=evaluation.ai_summary,
                evaluation_reason=evaluation.evaluation_reason,
                shap_explanation=shap_report,
                recommendations=rec_schemas,
                evaluated_at=evaluation.evaluated_at
            )
        )

    # Sort results by match percentage descending
    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results
