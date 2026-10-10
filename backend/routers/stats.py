"""
Dashboard Statistics Router
Provides aggregate recruitment metrics, KPI summaries, and pipeline analytics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from models.db_models import Job, Candidate, Evaluation
from models.schemas import DashboardStatsResponse, JobResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns high-level dashboard metrics for recruiters:
    - Total Jobs
    - Total Candidates
    - Candidates Analyzed
    - Average Match Score
    - Status Distribution (ACCEPT / REVIEW / REJECT)
    - Recent Jobs
    - Top Candidates
    """
    total_jobs = db.query(Job).count()
    total_candidates = db.query(Candidate).count()
    
    # Candidates analyzed (distinct candidates with at least 1 evaluation)
    candidates_analyzed = db.query(func.count(func.distinct(Evaluation.candidate_id))).scalar() or 0
    
    # Average Match Score
    avg_score_raw = db.query(func.avg(Evaluation.match_percentage)).scalar()
    average_match_score = round(float(avg_score_raw), 1) if avg_score_raw else 0.0

    # Status distribution
    status_counts = {"ACCEPT": 0, "REVIEW": 0, "REJECT": 0}
    status_records = (
        db.query(Evaluation.status, func.count(Evaluation.id))
        .group_by(Evaluation.status)
        .all()
    )
    for st, count in status_records:
        if st in status_counts:
            status_counts[st] = count

    # Recent jobs (up to 5)
    recent_jobs_db = db.query(Job).order_by(Job.created_at.desc()).limit(5).all()
    recent_jobs = []
    for j in recent_jobs_db:
        count = db.query(Evaluation).filter(Evaluation.job_id == j.id).count()
        r = JobResponse.model_validate(j)
        r.candidate_count = count
        recent_jobs.append(r)

    # Top candidates (top 5 by match percentage)
    top_evals = (
        db.query(Evaluation)
        .order_by(Evaluation.match_percentage.desc())
        .limit(5)
        .all()
    )
    top_candidates = []
    for ev in top_evals:
        cand = db.query(Candidate).filter(Candidate.id == ev.candidate_id).first()
        job = db.query(Job).filter(Job.id == ev.job_id).first()
        if cand:
            top_candidates.append({
                "candidate_id": cand.id,
                "name": cand.name,
                "job_id": ev.job_id,
                "job_title": job.title if job else "Role",
                "match_percentage": float(ev.match_percentage),
                "status": ev.status,
                "experience_years": float(cand.experience_years or 0.0),
                "matching_skills_count": len(ev.matching_skills or [])
            })

    return DashboardStatsResponse(
        total_jobs=total_jobs,
        total_candidates=total_candidates,
        candidates_analyzed=candidates_analyzed,
        average_match_score=average_match_score,
        status_distribution=status_counts,
        recent_jobs=recent_jobs,
        top_candidates=top_candidates
    )
