"""
Pydantic schemas for request validation and response serialization.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Common Schemas -----------------
class DeleteResponse(BaseModel):
    success: bool
    message: str

# ----------------- Job Schemas -----------------
class JobBase(BaseModel):
    title: str = Field(..., example="Senior Full Stack Engineer")
    department: Optional[str] = Field("Engineering", example="Product & Engineering")
    description: str = Field(..., example="We are looking for an experienced Full Stack Engineer with expertise in Python, React, and PostgreSQL.")
    required_skills: List[str] = Field(default_factory=list, example=["Python", "FastAPI", "React.js", "PostgreSQL", "Docker"])
    experience_required: int = Field(0, ge=0, example=4)
    education_requirement: Optional[str] = Field("Bachelor's Degree", example="B.S. in Computer Science or equivalent")

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    candidate_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- Resume & Skills Schemas -----------------
class ResumeUploadResponse(BaseModel):
    id: int
    candidate_id: Optional[int] = None
    file_name: str
    file_size_bytes: int
    file_type: str
    extracted_text_preview: str
    detected_name: Optional[str] = None
    detected_email: Optional[str] = None
    detected_skills: List[str] = []
    message: str = "Resume uploaded and pre-processed successfully."

class CandidateSkillSchema(BaseModel):
    id: Optional[int] = None
    skill_name: str
    category: str = "General"
    confidence_score: float = 1.0

    class Config:
        from_attributes = True

class SkillRecommendationSchema(BaseModel):
    id: Optional[int] = None
    skill_name: str
    priority: str = "HIGH"
    recommended_action: Optional[str] = None
    learning_resource_title: Optional[str] = None
    learning_provider: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Evaluation Schemas -----------------
class EvaluationResult(BaseModel):
    id: Optional[int] = None
    job_id: int
    job_title: Optional[str] = None
    candidate_id: int
    candidate_name: Optional[str] = None
    match_percentage: float
    semantic_similarity: float
    skill_match_score: float
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    status: str  # ACCEPT, REVIEW, REJECT
    ai_summary: Optional[str] = None
    evaluation_reason: Optional[str] = None
    shap_explanation: Dict[str, Any] = {}
    recommendations: List[SkillRecommendationSchema] = []
    evaluated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Candidate Schemas -----------------
class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    experience_years: float = 0.0
    education: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    skills: List[str] = []
    latest_evaluation: Optional[EvaluationResult] = None

    class Config:
        from_attributes = True

class CandidateDetailResponse(CandidateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    skills: List[CandidateSkillSchema] = []
    resumes: List[Dict[str, Any]] = []
    evaluations: List[EvaluationResult] = []

    class Config:
        from_attributes = True

# ----------------- Analysis & Dashboard Schemas -----------------
class AnalyzeRequest(BaseModel):
    job_id: int
    candidate_ids: Optional[List[int]] = None  # None means analyze all unanalyzed candidates for this job

class DashboardStatsResponse(BaseModel):
    total_jobs: int
    total_candidates: int
    candidates_analyzed: int
    average_match_score: float
    status_distribution: Dict[str, int]
    recent_jobs: List[JobResponse]
    top_candidates: List[Dict[str, Any]]
