"""
Evaluation Service
Assigns evaluation statuses (ACCEPT, REVIEW, REJECT) and generates recruiter decision support rationales.
"""

from typing import Dict, Any, List
from utils.constants import (
    STATUS_ACCEPT,
    STATUS_REVIEW,
    STATUS_REJECT,
    THRESHOLD_ACCEPT,
    THRESHOLD_REVIEW
)

def determine_status(match_percentage: float) -> str:
    """Determine recruiter triage recommendation status."""
    if match_percentage >= THRESHOLD_ACCEPT:
        return STATUS_ACCEPT
    elif match_percentage >= THRESHOLD_REVIEW:
        return STATUS_REVIEW
    else:
        return STATUS_REJECT

def generate_ai_summary(
    candidate_name: str,
    job_title: str,
    match_percentage: float,
    status: str,
    matching_skills: List[str],
    missing_skills: List[str],
    experience_years: float,
    job_experience_required: int
) -> str:
    """Creates a concise executive summary for recruiters."""
    skills_summary = (
        f"verified competencies in {', '.join(matching_skills[:4])}"
        if matching_skills
        else "limited direct keyword skill overlap"
    )
    
    summary = (
        f"{candidate_name} matches {match_percentage}% of the criteria for {job_title}. "
        f"The candidate brings approximately {experience_years:.1f} years of relevant industry experience "
        f"(target: {job_experience_required} yrs) with {skills_summary}."
    )
    if missing_skills:
        summary += f" Notable areas for development include: {', '.join(missing_skills[:3])}."

    return summary

def generate_evaluation_reason(
    status: str,
    match_percentage: float,
    matching_skills: List[str],
    missing_skills: List[str],
    experience_years: float,
    job_experience_required: int
) -> str:
    """
    Generates a structured, evidence-based reasoning statement for the recruiter.
    """
    reasons = []

    if status == STATUS_ACCEPT:
        reasons.append(
            f"Strong profile alignment ({match_percentage}%). "
            f"Candidate satisfies core technical prerequisites ({len(matching_skills)} matching skills)."
        )
        if experience_years >= job_experience_required:
            reasons.append(f"Experience benchmark exceeded ({experience_years:.1f} yrs vs {job_experience_required} yrs required).")
        reasons.append("Recommended next step: Proceed to recruiter technical phone screen.")

    elif status == STATUS_REVIEW:
        reasons.append(
            f"Moderate profile alignment ({match_percentage}%). "
            f"Candidate matches {len(matching_skills)} required skill(s) but has skill gaps in {', '.join(missing_skills[:3])}."
        )
        if experience_years < job_experience_required:
            reasons.append(f"Experience is slightly below requested baseline ({experience_years:.1f} yrs vs {job_experience_required} yrs).")
        reasons.append("Recommended next step: Manual recruiter review to assess transferable competencies and fast-track learning potential.")

    else: # REJECT
        reasons.append(
            f"Low alignment score ({match_percentage}%). "
            f"Candidate profile shows significant divergence from job specifications, lacking essential competencies: {', '.join(missing_skills[:4])}."
        )
        reasons.append("Recommended next step: Archive for alternative roles or prioritize higher-matching applicants.")

    # Ethical Recruiter Disclaimer
    reasons.append(
        "Notice: This assessment is an automated AI decision-support aid. Final evaluation rests entirely with the recruiting team."
    )

    return " ".join(reasons)

def evaluate_candidate_for_job(
    candidate_name: str,
    job_title: str,
    job_experience_required: int,
    candidate_experience_years: float,
    match_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates candidate match data and synthesizes final status, summary, and reason.
    """
    match_percentage = match_data["match_percentage"]
    matching_skills = match_data["matching_skills"]
    missing_skills = match_data["missing_skills"]

    status = determine_status(match_percentage)
    summary = generate_ai_summary(
        candidate_name=candidate_name,
        job_title=job_title,
        match_percentage=match_percentage,
        status=status,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        experience_years=candidate_experience_years,
        job_experience_required=job_experience_required
    )
    reason = generate_evaluation_reason(
        status=status,
        match_percentage=match_percentage,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        experience_years=candidate_experience_years,
        job_experience_required=job_experience_required
    )

    return {
        "status": status,
        "ai_summary": summary,
        "evaluation_reason": reason
    }
