"""
Resumes Router
Handles multiple PDF and DOCX resume uploads, text extraction, skill parsing, and candidate creation.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.db_models import Candidate, Resume, CandidateSkill, Job, Evaluation, SkillRecommendation
from models.schemas import ResumeUploadResponse
from utils.file_handler import save_uploaded_file
from services.resume_parser import extract_text_from_file
from services.text_preprocessor import extract_candidate_info, preprocess_resume_text
from services.skill_extractor import extract_skills
from services.matching_service import calculate_candidate_match
from services.evaluation_service import evaluate_candidate_for_job
from services.recommendation_service import generate_skill_recommendations
from services.explanation_service import generate_explainability_report

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=List[ResumeUploadResponse], status_code=status.HTTP_201_CREATED)
async def upload_resumes(
    files: List[UploadFile] = File(...),
    job_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload one or multiple resumes (PDF/DOCX).
    Extracts text, parses candidate info and skills, stores them in the database,
    and optionally executes immediate matching evaluation if job_id is provided.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No resume files were provided.")

    target_job = None
    if job_id:
        target_job = db.query(Job).filter(Job.id == job_id).first()
        if not target_job:
            raise HTTPException(status_code=404, detail=f"Target Job with ID {job_id} not found.")

    upload_results = []

    for file in files:
        try:
            # Read file bytes
            content = await file.read()
            if not content:
                continue

            # Save file to uploads folder
            saved_path, sanitized_name, file_size = save_uploaded_file(content, file.filename)

            # Extract raw text
            raw_text, file_type = extract_text_from_file(saved_path)
            if not raw_text.strip():
                raw_text = f"Candidate resume content extracted from {sanitized_name}."

            # Preprocess and extract info
            cand_info = extract_candidate_info(raw_text, sanitized_name)
            extracted_skills = extract_skills(raw_text)
            skill_names = [s["skill_name"] for s in extracted_skills]

            # Create or update candidate record
            candidate = Candidate(
                name=cand_info["name"],
                email=cand_info["email"],
                phone=cand_info["phone"],
                experience_years=cand_info["experience_years"],
                education=cand_info["education"],
                location="Location Not Specified"
            )
            db.add(candidate)
            db.flush()

            # Store Resume entity
            resume_record = Resume(
                candidate_id=candidate.id,
                file_name=sanitized_name,
                file_path=saved_path,
                file_size_bytes=file_size,
                file_type=file_type,
                raw_text=raw_text,
                extracted_text_clean=cand_info["cleaned_text"]
            )
            db.add(resume_record)

            # Store Candidate Skills
            for sk_item in extracted_skills:
                c_skill = CandidateSkill(
                    candidate_id=candidate.id,
                    skill_name=sk_item["skill_name"],
                    category=sk_item["category"],
                    confidence_score=sk_item["confidence_score"]
                )
                db.add(c_skill)

            # If job_id is linked, run AI evaluation immediately
            if target_job:
                match_data = calculate_candidate_match(
                    job_description=target_job.description,
                    job_required_skills=target_job.required_skills,
                    job_experience_required=target_job.experience_required,
                    candidate_resume_text=raw_text,
                    candidate_skills=skill_names,
                    candidate_experience_years=cand_info["experience_years"],
                    candidate_education=cand_info["education"]
                )

                eval_data = evaluate_candidate_for_job(
                    candidate_name=candidate.name,
                    job_title=target_job.title,
                    job_experience_required=target_job.experience_required,
                    candidate_experience_years=cand_info["experience_years"],
                    match_data=match_data
                )

                shap_report = generate_explainability_report(
                    match_data=match_data,
                    candidate_name=candidate.name,
                    job_title=target_job.title
                )

                evaluation = Evaluation(
                    job_id=target_job.id,
                    candidate_id=candidate.id,
                    match_percentage=match_data["match_percentage"],
                    semantic_similarity=match_data["semantic_similarity"],
                    skill_match_score=match_data["skill_match_score"],
                    matching_skills=match_data["matching_skills"],
                    missing_skills=match_data["missing_skills"],
                    status=eval_data["status"],
                    ai_summary=eval_data["ai_summary"],
                    evaluation_reason=eval_data["evaluation_reason"],
                    shap_explanation=shap_report
                )
                db.add(evaluation)
                db.flush()

                # Generate recommendations
                recommendations = generate_skill_recommendations(match_data["missing_skills"])
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

            db.commit()

            upload_results.append(
                ResumeUploadResponse(
                    id=resume_record.id,
                    candidate_id=candidate.id,
                    file_name=sanitized_name,
                    file_size_bytes=file_size,
                    file_type=file_type,
                    extracted_text_preview=raw_text[:280] + "..." if len(raw_text) > 280 else raw_text,
                    detected_name=candidate.name,
                    detected_email=candidate.email,
                    detected_skills=skill_names[:8],
                    message="Resume successfully uploaded, parsed and candidate profile created."
                )
            )

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file '{file.filename}': {str(e)}"
            )

    return upload_results
