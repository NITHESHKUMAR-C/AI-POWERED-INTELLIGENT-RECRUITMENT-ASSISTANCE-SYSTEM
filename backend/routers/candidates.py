"""
Candidates Router
Endpoints for querying candidate directory and retrieving candidate details.
"""

import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from models.db_models import Candidate, CandidateSkill, Evaluation, Resume, Job, SkillRecommendation
from models.schemas import (
    CandidateResponse,
    CandidateDetailResponse,
    EvaluationResult,
    SkillRecommendationSchema,
    CandidateSkillSchema,
    DeleteResponse
)

logger = logging.getLogger("recruitment_candidates")

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
def get_candidates(
    job_id: Optional[int] = Query(None, description="Filter candidates by evaluated job"),
    status: Optional[str] = Query(None, description="Filter by evaluation status: ACCEPT, REVIEW, REJECT"),
    search: Optional[str] = Query(None, description="Search by candidate name or skill"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List candidates with optional filtering by job, status, or search query.
    Returns latest evaluation details and extracted skills.
    """
    query = db.query(Candidate)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Candidate.name.ilike(search_pattern)) |
            (Candidate.email.ilike(search_pattern))
        )

    candidates = query.order_by(Candidate.created_at.desc()).offset(skip).limit(limit).all()
    results = []

    for cand in candidates:
        # Get candidate's extracted skills
        skill_names = [s.skill_name for s in cand.skills]

        # Get relevant evaluation (filtered by job_id if requested, or latest)
        eval_query = db.query(Evaluation).filter(Evaluation.candidate_id == cand.id)
        if job_id:
            eval_query = eval_query.filter(Evaluation.job_id == job_id)
        if status:
            eval_query = eval_query.filter(Evaluation.status == status.upper())

        evaluation = eval_query.order_by(Evaluation.evaluated_at.desc()).first()

        # If job_id or status filter was applied and no evaluation matched, skip candidate
        if (job_id or status) and not evaluation:
            continue

        eval_schema = None
        if evaluation:
            job_obj = db.query(Job).filter(Job.id == evaluation.job_id).first()
            job_title = job_obj.title if job_obj else "Unknown Position"
            
            recs = [SkillRecommendationSchema.model_validate(r) for r in evaluation.recommendations]

            eval_schema = EvaluationResult(
                id=evaluation.id,
                job_id=evaluation.job_id,
                job_title=job_title,
                candidate_id=cand.id,
                candidate_name=cand.name,
                match_percentage=float(evaluation.match_percentage),
                semantic_similarity=float(evaluation.semantic_similarity),
                skill_match_score=float(evaluation.skill_match_score),
                matching_skills=evaluation.matching_skills or [],
                missing_skills=evaluation.missing_skills or [],
                status=evaluation.status,
                ai_summary=evaluation.ai_summary,
                evaluation_reason=evaluation.evaluation_reason,
                shap_explanation=evaluation.shap_explanation or {},
                recommendations=recs,
                evaluated_at=evaluation.evaluated_at
            )

        resp_item = CandidateResponse(
            id=cand.id,
            name=cand.name,
            email=cand.email,
            phone=cand.phone,
            experience_years=float(cand.experience_years or 0.0),
            education=cand.education,
            location=cand.location,
            linkedin_url=cand.linkedin_url,
            created_at=cand.created_at,
            skills=skill_names,
            latest_evaluation=eval_schema
        )
        results.append(resp_item)

    return results

@router.get("/{candidate_id}", response_model=CandidateDetailResponse)
def get_candidate_details(candidate_id: int, db: Session = Depends(get_db)):
    """
    Retrieve comprehensive candidate profile including contact info, education,
    experience, extracted skills, resumes, evaluations, AI summary, recommendations and SHAP breakdown.
    """
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found.")

    skills_data = [
        CandidateSkillSchema(
            id=s.id,
            skill_name=s.skill_name,
            category=s.category,
            confidence_score=float(s.confidence_score or 1.0)
        )
        for s in cand.skills
    ]

    resumes_data = [
        {
            "id": r.id,
            "file_name": r.file_name,
            "file_type": r.file_type,
            "file_size_bytes": r.file_size_bytes,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None
        }
        for r in cand.resumes
    ]

    evaluations_data = []
    for ev in cand.evaluations:
        job_obj = db.query(Job).filter(Job.id == ev.job_id).first()
        job_title = job_obj.title if job_obj else "General Role"

        recs = [SkillRecommendationSchema.model_validate(r) for r in ev.recommendations]

        eval_obj = EvaluationResult(
            id=ev.id,
            job_id=ev.job_id,
            job_title=job_title,
            candidate_id=cand.id,
            candidate_name=cand.name,
            match_percentage=float(ev.match_percentage),
            semantic_similarity=float(ev.semantic_similarity),
            skill_match_score=float(ev.skill_match_score),
            matching_skills=ev.matching_skills or [],
            missing_skills=ev.missing_skills or [],
            status=ev.status,
            ai_summary=ev.ai_summary,
            evaluation_reason=ev.evaluation_reason,
            shap_explanation=ev.shap_explanation or {},
            recommendations=recs,
            evaluated_at=ev.evaluated_at
        )
        evaluations_data.append(eval_obj)

    return CandidateDetailResponse(
        id=cand.id,
        name=cand.name,
        email=cand.email,
        phone=cand.phone,
        experience_years=float(cand.experience_years or 0.0),
        education=cand.education,
        location=cand.location,
        linkedin_url=cand.linkedin_url,
        created_at=cand.created_at,
        updated_at=cand.updated_at,
        skills=skills_data,
        resumes=resumes_data,
        evaluations=evaluations_data
    )

@router.delete("/{candidate_id}", response_model=DeleteResponse)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """
    Permanently delete candidate record and all associated records (resumes,
    candidate skills, evaluations, recommendations, and files on disk).
    """
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "message": "Candidate not found"}
        )

    try:
        # 1. Unlink and remove uploaded physical resume files on disk
        resumes = db.query(Resume).filter(Resume.candidate_id == cand.id).all()
        for r in resumes:
            if r.file_path and os.path.exists(r.file_path):
                try:
                    os.remove(r.file_path)
                except Exception as ex:
                    logger.warning(f"Could not remove physical resume file {r.file_path}: {ex}")

        # 2. Delete skill recommendations linked to candidate's evaluations
        eval_ids = [e.id for e in db.query(Evaluation.id).filter(Evaluation.candidate_id == cand.id).all()]
        if eval_ids:
            db.query(SkillRecommendation).filter(SkillRecommendation.evaluation_id.in_(eval_ids)).delete(synchronize_session=False)

        # 3. Explicitly delete evaluations
        db.query(Evaluation).filter(Evaluation.candidate_id == cand.id).delete(synchronize_session=False)

        # 4. Explicitly delete candidate skills
        db.query(CandidateSkill).filter(CandidateSkill.candidate_id == cand.id).delete(synchronize_session=False)

        # 5. Explicitly delete resumes
        db.query(Resume).filter(Resume.candidate_id == cand.id).delete(synchronize_session=False)

        # 6. Delete candidate
        db.delete(cand)
        db.commit()

        logger.info(f"Successfully deleted candidate ID {candidate_id}")
        return {"success": True, "message": "Candidate deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete candidate ID {candidate_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to delete candidate: {str(e)}"
        )
