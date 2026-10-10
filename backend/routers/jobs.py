"""
Jobs Router
Endpoints for creating and retrieving job postings.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from models.db_models import Job, Evaluation, SkillRecommendation
from models.schemas import JobCreate, JobResponse, DeleteResponse

logger = logging.getLogger("recruitment_jobs")

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Create a new job posting."""
    job = Job(
        title=job_in.title,
        department=job_in.department or "Engineering",
        description=job_in.description,
        required_skills=job_in.required_skills,
        experience_required=job_in.experience_required,
        education_requirement=job_in.education_requirement,
        status="ACTIVE"
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Attach candidate_count = 0
    resp = JobResponse.model_validate(job)
    resp.candidate_count = 0
    return resp

@router.get("", response_model=List[JobResponse])
def get_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all available job postings."""
    jobs = db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for j in jobs:
        count = db.query(Evaluation).filter(Evaluation.job_id == j.id).count()
        r = JobResponse.model_validate(j)
        r.candidate_count = count
        results.append(r)
    return results

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single job posting by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found.")
    
    count = db.query(Evaluation).filter(Evaluation.job_id == job.id).count()
    resp = JobResponse.model_validate(job)
    resp.candidate_count = count
    return resp

@router.delete("/{job_id}", response_model=DeleteResponse)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """
    Permanently delete job record and associated evaluations and skill recommendations.
    Candidate profile records are preserved.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"success": False, "message": "Job not found"}
        )

    try:
        # 1. Find evaluation IDs associated with this job
        eval_ids = [e.id for e in db.query(Evaluation.id).filter(Evaluation.job_id == job.id).all()]
        if eval_ids:
            # 2. Delete skill recommendations linked to these evaluations
            db.query(SkillRecommendation).filter(SkillRecommendation.evaluation_id.in_(eval_ids)).delete(synchronize_session=False)
            # 3. Delete evaluations for this job
            db.query(Evaluation).filter(Evaluation.job_id == job.id).delete(synchronize_session=False)

        # 4. Delete the job record
        db.delete(job)
        db.commit()

        logger.info(f"Successfully deleted job ID {job_id}")
        return {"success": True, "message": "Job deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete job ID {job_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to delete job: {str(e)}"
        )

