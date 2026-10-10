-- PostgreSQL Database Schema for AI-Powered Intelligent Recruitment Assistance System

-- Drop tables in reverse order of dependencies if recreating
DROP TABLE IF EXISTS skill_recommendations CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS candidate_skills CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- 1. Jobs Table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_required INT NOT NULL DEFAULT 0,
    education_requirement VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidates Table
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    experience_years NUMERIC(4, 1) DEFAULT 0.0,
    education TEXT,
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Resumes Table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes INT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    raw_text TEXT NOT NULL,
    extracted_text_clean TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Candidate Skills Table
CREATE TABLE candidate_skills (
    id SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    confidence_score NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_skill UNIQUE (candidate_id, skill_name)
);

-- 5. Evaluations Table (AI Matching & Recruiter Decision Support)
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    match_percentage NUMERIC(5, 2) NOT NULL,
    semantic_similarity NUMERIC(5, 4) NOT NULL,
    skill_match_score NUMERIC(5, 2) NOT NULL,
    matching_skills TEXT[] NOT NULL DEFAULT '{}',
    missing_skills TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACCEPT', 'REVIEW', 'REJECT')),
    ai_summary TEXT,
    evaluation_reason TEXT,
    shap_explanation JSONB DEFAULT '{}',
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_candidate_eval UNIQUE (job_id, candidate_id)
);

-- 6. Skill Recommendations Table
CREATE TABLE skill_recommendations (
    id SERIAL PRIMARY KEY,
    evaluation_id INT REFERENCES evaluations(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'HIGH',
    recommended_action TEXT,
    learning_resource_title VARCHAR(255),
    learning_provider VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_evaluations_job_id ON evaluations(job_id);
CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_match ON evaluations(match_percentage DESC);
CREATE INDEX idx_candidate_skills_name ON candidate_skills(skill_name);
