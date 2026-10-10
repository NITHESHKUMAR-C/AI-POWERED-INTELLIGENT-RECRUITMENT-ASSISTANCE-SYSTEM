"""
Matching Service
Calculates transparent candidate-to-job match scores combining semantic similarity,
skill coverage, experience alignment, and education fit.
"""

from typing import List, Dict, Any, Tuple
from services.embedding_service import get_embedding_service
from utils.constants import (
    WEIGHT_SEMANTIC_SIMILARITY,
    WEIGHT_SKILL_MATCH,
    WEIGHT_EXPERIENCE_MATCH,
    WEIGHT_EDUCATION_MATCH
)

def normalize_skill_set(skills: List[str]) -> List[str]:
    """Helper to standardize skill strings for comparison."""
    return [s.strip() for s in skills if s and s.strip()]

def calculate_candidate_match(
    job_description: str,
    job_required_skills: List[str],
    job_experience_required: int,
    candidate_resume_text: str,
    candidate_skills: List[str],
    candidate_experience_years: float,
    candidate_education: str = ""
) -> Dict[str, Any]:
    """
    Executes multi-factor candidate matching against job criteria.
    Returns:
        - match_percentage (0.0 to 100.0)
        - semantic_similarity (0.0 to 1.0)
        - skill_match_score (0.0 to 100.0)
        - matching_skills
        - missing_skills
        - component_scores breakdown
    """
    embedding_svc = get_embedding_service()

    # 1. Semantic Similarity
    job_full_context = f"{job_description}\nRequired Key Skills: {', '.join(job_required_skills)}"
    semantic_similarity = embedding_svc.compute_similarity(job_full_context, candidate_resume_text)

    # 2. Skill Matching Analysis
    req_skills_normalized = normalize_skill_set(job_required_skills)
    cand_skills_normalized = normalize_skill_set(candidate_skills)

    cand_skills_lower_map = {s.lower(): s for s in cand_skills_normalized}

    matching_skills = []
    missing_skills = []

    for req in req_skills_normalized:
        req_lower = req.lower()
        if req_lower in cand_skills_lower_map:
            matching_skills.append(req)
        # Check partial or contained matches (e.g. 'React' in 'React.js')
        elif any(req_lower in cs or cs in req_lower for cs in cand_skills_lower_map):
            matching_skills.append(req)
        else:
            missing_skills.append(req)

    total_req = len(req_skills_normalized)
    if total_req > 0:
        skill_match_score = (len(matching_skills) / total_req) * 100.0
    else:
        skill_match_score = 100.0

    # 3. Experience Match Score
    if job_experience_required <= 0:
        exp_match_score = 100.0
    else:
        # Full score if meets or exceeds required years, proportional otherwise
        ratio = float(candidate_experience_years) / float(job_experience_required)
        exp_match_score = min(100.0, ratio * 100.0)

    # 4. Education Score (heuristic baseline)
    edu_match_score = 85.0
    cand_edu_lower = (candidate_education or "").lower()
    if any(deg in cand_edu_lower for deg in ["master", "m.s", "phd", "doctorate"]):
        edu_match_score = 100.0
    elif any(deg in cand_edu_lower for deg in ["bachelor", "b.tech", "b.e", "b.s"]):
        edu_match_score = 90.0

    # 5. Composite Final Match Percentage (0 - 100)
    composite_score = (
        (semantic_similarity * 100.0 * WEIGHT_SEMANTIC_SIMILARITY) +
        (skill_match_score * WEIGHT_SKILL_MATCH) +
        (exp_match_score * WEIGHT_EXPERIENCE_MATCH) +
        (edu_match_score * WEIGHT_EDUCATION_MATCH)
    )

    final_match_percentage = round(max(5.0, min(99.0, composite_score)), 1)

    return {
        "match_percentage": final_match_percentage,
        "semantic_similarity": round(semantic_similarity, 4),
        "skill_match_score": round(skill_match_score, 1),
        "experience_match_score": round(exp_match_score, 1),
        "education_match_score": round(edu_match_score, 1),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "weights": {
            "semantic": WEIGHT_SEMANTIC_SIMILARITY,
            "skills": WEIGHT_SKILL_MATCH,
            "experience": WEIGHT_EXPERIENCE_MATCH,
            "education": WEIGHT_EDUCATION_MATCH
        }
    }
