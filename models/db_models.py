"""
SQLAlchemy ORM models for jobs, candidates, resumes, skills, evaluations, and recommendations.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database.connection import Base

def utcnow():
    return datetime.now(timezone.utc)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(100), default="Engineering")
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list, nullable=False)  # List of string skill names
    experience_required = Column(Integer, default=0, nullable=False)
    education_requirement = Column(String(255), default="Bachelor's Degree")
    status = Column(String(50), default="ACTIVE", index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    evaluations = relationship("Evaluation", back_populates="job", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    experience_years = Column(Numeric(4, 1), default=0.0)
    education = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="candidate", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    file_type = Column(String(20), nullable=False)  # pdf, docx
    raw_text = Column(Text, nullable=False)
    extracted_text_clean = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="resumes")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="General")
    confidence_score = Column(Numeric(3, 2), default=1.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="skills")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    match_percentage = Column(Numeric(5, 2), nullable=False, index=True)
    semantic_similarity = Column(Numeric(5, 4), default=0.0)
    skill_match_score = Column(Numeric(5, 2), default=0.0)
    matching_skills = Column(JSON, default=list, nullable=False)
    missing_skills = Column(JSON, default=list, nullable=False)
    status = Column(String(20), nullable=False, index=True)  # ACCEPT, REVIEW, REJECT
    ai_summary = Column(Text, nullable=True)
    evaluation_reason = Column(Text, nullable=True)
    shap_explanation = Column(JSON, default=dict)  # SHAP / LIME attribution metrics
    evaluated_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    job = relationship("Job", back_populates="evaluations")
    candidate = relationship("Candidate", back_populates="evaluations")
    recommendations = relationship("SkillRecommendation", back_populates="evaluation", cascade="all, delete-orphan")


class SkillRecommendation(Base):
    __tablename__ = "skill_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    priority = Column(String(50), default="HIGH")  # HIGH, MEDIUM, LOW
    recommended_action = Column(Text, nullable=True)
    learning_resource_title = Column(String(255), nullable=True)
    learning_provider = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    evaluation = relationship("Evaluation", back_populates="recommendations")
