"""
Seed data module for initializing realistic demo jobs, candidates, resumes, and evaluations.
"""

import logging
from database.connection import SessionLocal
from models.db_models import Job, Candidate, Resume, CandidateSkill, Evaluation, SkillRecommendation

logger = logging.getLogger("seed_data")

DEMO_JOBS = [
    {
        "title": "Senior Full Stack Engineer",
        "department": "Engineering",
        "description": "We are seeking a seasoned Senior Full Stack Engineer to architect, develop, and scale mission-critical web applications. You will work across the entire stack, developing robust RESTful APIs in Python/FastAPI, modern user interfaces in React.js, and managing relational databases with PostgreSQL. You will also collaborate on cloud deployments using Docker and Kubernetes.",
        "required_skills": ["Python", "FastAPI", "React.js", "PostgreSQL", "Docker", "REST APIs", "Git"],
        "experience_required": 4,
        "education_requirement": "Bachelor's Degree in Computer Science or equivalent",
        "status": "ACTIVE"
    },
    {
        "title": "AI / Machine Learning Engineer",
        "department": "AI Research",
        "description": "Looking for an innovative AI/ML Engineer to train, fine-tune, and deploy state-of-the-art Natural Language Processing (NLP) models, Large Language Models (LLMs), and deep learning architectures into production. Experience with PyTorch, Scikit-Learn, Hugging Face, spaCy, and vector databases is essential.",
        "required_skills": ["Python", "PyTorch", "Natural Language Processing", "Machine Learning", "Scikit-Learn", "spaCy", "Docker"],
        "experience_required": 3,
        "education_requirement": "Master's or Bachelor's in CS / AI / Data Science",
        "status": "ACTIVE"
    },
    {
        "title": "Cloud DevOps & Platform Engineer",
        "department": "Infrastructure",
        "description": "Join our infrastructure engineering group to manage high-availability cloud platforms. You will establish automated CI/CD pipelines, orchestrate Kubernetes clusters, automate infrastructure with Terraform, and manage AWS multi-region services.",
        "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Python"],
        "experience_required": 5,
        "education_requirement": "Bachelor's Degree in Computer Science or Engineering",
        "status": "ACTIVE"
    }
]

DEMO_CANDIDATES = [
    {
        "name": "Sarah Chen",
        "email": "sarah.chen@techmail.io",
        "phone": "+1 (415) 890-2341",
        "experience_years": 5.5,
        "education": "M.S. in Computer Science, Stanford University",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/sarahchen-dev",
        "skills": ["Python", "FastAPI", "React.js", "PostgreSQL", "Docker", "REST APIs", "Git", "TypeScript", "Redis"],
        "job_evaluations": [
            {
                "job_index": 0, # Senior Full Stack
                "match_percentage": 94.5,
                "semantic_similarity": 0.92,
                "skill_match_score": 100.0,
                "matching_skills": ["Python", "FastAPI", "React.js", "PostgreSQL", "Docker", "REST APIs", "Git"],
                "missing_skills": [],
                "status": "ACCEPT",
                "ai_summary": "Sarah Chen matches 94.5% of the criteria for Senior Full Stack Engineer. Brings 5.5 years of experience (target: 4 yrs) with verified mastery across the entire Python, React, and PostgreSQL stack.",
                "evaluation_reason": "Exceptional profile alignment (94.5%). Candidate satisfies all 7 mandatory technical requirements and exceeds experience benchmark. Highly recommended for immediate technical interview.",
                "recommendations": [
                    {
                        "skill_name": "Kubernetes",
                        "priority": "LOW",
                        "recommended_action": "Familiarize with Kubernetes cluster management for advanced DevOps collaboration.",
                        "learning_resource_title": "Production Kubernetes & Cluster Management",
                        "learning_provider": "CNCF Certified Kubernetes Administrator (CKA)"
                    }
                ]
            }
        ]
    },
    {
        "name": "Marcus Vance",
        "email": "marcus.vance@codecloud.net",
        "phone": "+1 (206) 555-7819",
        "experience_years": 3.0,
        "education": "B.S. in Software Engineering, Univ. of Washington",
        "location": "Seattle, WA",
        "linkedin_url": "https://linkedin.com/in/marcusvance",
        "skills": ["Python", "React.js", "Git", "JavaScript", "HTML5", "CSS3", "Flask"],
        "job_evaluations": [
            {
                "job_index": 0, # Senior Full Stack
                "match_percentage": 68.0,
                "semantic_similarity": 0.74,
                "skill_match_score": 57.1,
                "matching_skills": ["Python", "React.js", "Git"],
                "missing_skills": ["FastAPI", "PostgreSQL", "Docker", "REST APIs"],
                "status": "REVIEW",
                "ai_summary": "Marcus Vance matches 68.0% of the criteria for Senior Full Stack Engineer. Brings 3.0 years of experience (target: 4 yrs) with solid Python and React fundamentals, but lacks direct experience in FastAPI, Docker, and PostgreSQL.",
                "evaluation_reason": "Moderate profile alignment (68.0%). Meets frontend and core language requirements but has gaps in backend containerization and database architecture. Recruiter review recommended to explore fast ramp-up potential.",
                "recommendations": [
                    {
                        "skill_name": "FastAPI",
                        "priority": "HIGH",
                        "recommended_action": "Complete intensive course on building asynchronous REST services with FastAPI.",
                        "learning_resource_title": "Modern High-Performance APIs with FastAPI",
                        "learning_provider": "FastAPI Official Curriculum"
                    },
                    {
                        "skill_name": "Docker",
                        "priority": "HIGH",
                        "recommended_action": "Practice containerization and multi-container orchestration.",
                        "learning_resource_title": "Containerization & Microservices with Docker",
                        "learning_provider": "Docker Mastery Bootcamp"
                    },
                    {
                        "skill_name": "PostgreSQL",
                        "priority": "MEDIUM",
                        "recommended_action": "Deepen relational database indexing and query optimization skills.",
                        "learning_resource_title": "High-Performance PostgreSQL & Query Optimization",
                        "learning_provider": "PostgreSQL Tutorial"
                    }
                ]
            }
        ]
    },
    {
        "name": "Elena Rostova",
        "email": "elena.rostova@datasphere.ai",
        "phone": "+1 (617) 432-9011",
        "experience_years": 4.5,
        "education": "Ph.D. in Computer Science, MIT",
        "location": "Boston, MA",
        "linkedin_url": "https://linkedin.com/in/elena-rostova-ai",
        "skills": ["Python", "PyTorch", "Natural Language Processing", "Machine Learning", "Scikit-Learn", "spaCy", "Docker", "Hugging Face", "Pandas", "NumPy"],
        "job_evaluations": [
            {
                "job_index": 1, # AI / ML Engineer
                "match_percentage": 96.0,
                "semantic_similarity": 0.95,
                "skill_match_score": 100.0,
                "matching_skills": ["Python", "PyTorch", "Natural Language Processing", "Machine Learning", "Scikit-Learn", "spaCy", "Docker"],
                "missing_skills": [],
                "status": "ACCEPT",
                "ai_summary": "Elena Rostova matches 96.0% of the criteria for AI / Machine Learning Engineer. Holds a Ph.D. in Computer Science from MIT with 4.5 years of cutting-edge NLP and PyTorch experience.",
                "evaluation_reason": "Outstanding candidate profile (96.0%). Perfectly aligned with NLP and deep learning research requirements. Advance immediately to technical panel.",
                "recommendations": [
                    {
                        "skill_name": "System Design",
                        "priority": "LOW",
                        "recommended_action": "Review large-scale distributed inference serving architectures.",
                        "learning_resource_title": "Large Scale Distributed Systems Design",
                        "learning_provider": "Grokking Modern System Design"
                    }
                ]
            }
        ]
    },
    {
        "name": "David Miller",
        "email": "d.miller@legacyapps.org",
        "phone": "+1 (312) 889-1122",
        "experience_years": 1.5,
        "education": "B.A. in Graphic Design, Columbia College",
        "location": "Chicago, IL",
        "linkedin_url": "https://linkedin.com/in/davidmiller-design",
        "skills": ["HTML5", "CSS3", "jQuery", "Bootstrap"],
        "job_evaluations": [
            {
                "job_index": 0, # Senior Full Stack
                "match_percentage": 34.0,
                "semantic_similarity": 0.38,
                "skill_match_score": 0.0,
                "matching_skills": [],
                "missing_skills": ["Python", "FastAPI", "React.js", "PostgreSQL", "Docker", "REST APIs", "Git"],
                "status": "REJECT",
                "ai_summary": "David Miller matches 34.0% of the criteria for Senior Full Stack Engineer. Has 1.5 years experience primarily in UI design and basic web styling, without required backend, database, or modern JavaScript framework experience.",
                "evaluation_reason": "Low alignment score (34.0%). The profile lacks critical backend and system requirements for a senior engineering role. Not recommended for current vacancy.",
                "recommendations": [
                    {
                        "skill_name": "Python",
                        "priority": "HIGH",
                        "recommended_action": "Start with foundational backend engineering and object-oriented programming in Python.",
                        "learning_resource_title": "Complete Python Developer Bootcamp",
                        "learning_provider": "Zero To Mastery"
                    },
                    {
                        "skill_name": "React.js",
                        "priority": "HIGH",
                        "recommended_action": "Learn component state, props, and modern frontend application development with React.",
                        "learning_resource_title": "Modern React with Hooks, Redux & Performance",
                        "learning_provider": "React Official"
                    }
                ]
            }
        ]
    }
]

def seed_initial_data():
    """Seeds initial jobs, candidates and evaluations if database is empty."""
    db = SessionLocal()
    try:
        existing_jobs = db.query(Job).count()
        if existing_jobs > 0:
            logger.info(f"Database already contains {existing_jobs} jobs. Skipping seed.")
            return

        logger.info("Seeding initial jobs and candidates into database...")

        # 1. Create Jobs
        created_jobs = []
        for job_data in DEMO_JOBS:
            job = Job(**job_data)
            db.add(job)
            db.flush()
            created_jobs.append(job)

        # 2. Create Candidates, Skills, Resumes, and Evaluations
        for cand_data in DEMO_CANDIDATES:
            skills = cand_data.get("skills", [])
            eval_list = cand_data.get("job_evaluations", [])

            candidate = Candidate(
                name=cand_data["name"],
                email=cand_data["email"],
                phone=cand_data["phone"],
                experience_years=cand_data["experience_years"],
                education=cand_data["education"],
                location=cand_data["location"],
                linkedin_url=cand_data["linkedin_url"]
            )
            db.add(candidate)
            db.flush()

            # Add Skills
            for sk in skills:
                from services.skill_extractor import get_skill_category
                c_skill = CandidateSkill(
                    candidate_id=candidate.id,
                    skill_name=sk,
                    category=get_skill_category(sk),
                    confidence_score=0.95
                )
                db.add(c_skill)

            # Add Dummy Resume Record
            resume = Resume(
                candidate_id=candidate.id,
                file_name=f"{candidate.name.replace(' ', '_')}_Resume.pdf",
                file_path=f"uploads/{candidate.name.replace(' ', '_')}_Resume.pdf",
                file_size_bytes=145200,
                file_type="pdf",
                raw_text=f"Resume of {candidate.name}. Experience: {candidate.experience_years} years. Skills: {', '.join(skills)}. Education: {candidate.education}.",
                extracted_text_clean=f"Resume of {candidate.name}. Experience: {candidate.experience_years} years. Skills: {', '.join(skills)}. Education: {candidate.education}."
            )
            db.add(resume)

            # Add Evaluations
            for ev in eval_list:
                target_job = created_jobs[ev["job_index"]]
                
                # Generate explainability payload
                shap_payload = {
                    "final_score": ev["match_percentage"],
                    "feature_attributions": [
                        {
                            "feature": "Skill Match Overlap",
                            "score": ev["skill_match_score"],
                            "weight": "40%",
                            "contribution_points": round(ev["skill_match_score"] * 0.4, 2),
                            "max_possible_points": 40.0,
                            "status": "positive" if ev["skill_match_score"] >= 60 else "negative",
                            "description": f"Candidate possesses {len(ev['matching_skills'])} of the required competencies."
                        },
                        {
                            "feature": "Semantic Similarity",
                            "score": round(ev["semantic_similarity"] * 100, 1),
                            "weight": "40%",
                            "contribution_points": round(ev["semantic_similarity"] * 40.0, 2),
                            "max_possible_points": 40.0,
                            "status": "positive" if ev["semantic_similarity"] >= 0.6 else "negative",
                            "description": "Deep contextual embedding match between resume text and role responsibilities."
                        },
                        {
                            "feature": "Experience Alignment",
                            "score": 100.0 if candidate.experience_years >= target_job.experience_required else round((candidate.experience_years / target_job.experience_required) * 100, 1),
                            "weight": "10%",
                            "contribution_points": 10.0 if candidate.experience_years >= target_job.experience_required else round((candidate.experience_years / target_job.experience_required) * 10.0, 2),
                            "max_possible_points": 10.0,
                            "status": "positive" if candidate.experience_years >= target_job.experience_required else "negative",
                            "description": "Total professional years compared against the role's required tenure."
                        },
                        {
                            "feature": "Education & Background",
                            "score": 95.0,
                            "weight": "10%",
                            "contribution_points": 9.5,
                            "max_possible_points": 10.0,
                            "status": "positive",
                            "description": "Relevance of academic degrees and certifications to the job profile."
                        }
                    ],
                    "positive_drivers": [f"+ Direct match on required skill: '{s}'" for s in ev["matching_skills"][:4]],
                    "negative_drivers": [f"- Missing core skill prerequisite: '{s}'" for s in ev["missing_skills"][:4]],
                    "model_type": "Hybrid SHAP-Attributed Linear Ensemble (Cosine Embeddings + Taxonomy Graph)",
                    "confidence_level": "High (94.2% feature reliability)"
                }

                evaluation = Evaluation(
                    job_id=target_job.id,
                    candidate_id=candidate.id,
                    match_percentage=ev["match_percentage"],
                    semantic_similarity=ev["semantic_similarity"],
                    skill_match_score=ev["skill_match_score"],
                    matching_skills=ev["matching_skills"],
                    missing_skills=ev["missing_skills"],
                    status=ev["status"],
                    ai_summary=ev["ai_summary"],
                    evaluation_reason=ev["evaluation_reason"],
                    shap_explanation=shap_payload
                )
                db.add(evaluation)
                db.flush()

                # Add Recommendations
                for rec in ev.get("recommendations", []):
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
        logger.info("Initial demo jobs and candidates successfully seeded!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding initial data: {e}")
    finally:
        db.close()
