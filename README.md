# AI-Powered Intelligent Recruitment Assistance System

An enterprise-ready, recruiter-focused AI platform engineered for automated resume ingestion, deep semantic candidate-to-job matching, explainable SHAP/LIME-inspired scoring attribution, and targeted upskilling recommendations.

---

## 1. Project Overview

The **AI-Powered Intelligent Recruitment Assistance System** serves as an interactive decision-support copilot for hiring teams and recruiters. Rather than relying on simple keyword counters or opaque black-box models, the platform combines:
- **Multi-Format Resume Parsing**: Automated extraction of text and metadata from PDF and DOCX files.
- **Deep Semantic Embeddings**: Text representations generated using Sentence Transformers (`all-MiniLM-L6-v2`) and contextual vectorizers to compute true role-to-resume cosine similarity.
- **Taxonomy-Driven Skill Extraction**: Automated mapping of programming languages, frameworks, cloud tools, databases, and methodologies.
- **Transparent Multi-Factor Scoring**: Weighted combination of semantic similarity (40%), required skill coverage (40%), experience duration (10%), and academic background (10%).
- **Recruiter Decision Triage**: Categorization into `ACCEPT` (≥75%), `REVIEW` (50–74%), and `REJECT` (<50%).
- **Explainable AI (XAI)**: SHAP/LIME-style factor decomposition highlighting exactly which skills and experience drove the score up or down.
- **Targeted Upskilling Roadmaps**: Actionable recommendations and curated courses for addressing candidate skill deficits.
- **Ethical Human-in-the-Loop Safeguards**: Explicitly framed as recruiter decision support—AI assists, but human recruiters make the final hiring decisions.

---

## 2. Architecture & Project Structure

The project is structured in a clean, decoupled, production-ready modular layout:

```
project-root/
│
├── backend/                  # FastAPI Application Layer
│   ├── routers/              # Modular REST API endpoints
│   │   ├── jobs.py           # Job requisition creation & retrieval
│   │   ├── resumes.py        # PDF & DOCX upload and parsing
│   │   ├── candidates.py     # Candidate directory & comprehensive profiles
│   │   ├── analysis.py       # AI matching & batch evaluation engine
│   │   └── stats.py          # Dashboard aggregate analytics & metrics
│   ├── config.py             # Environment settings (Pydantic BaseSettings)
│   └── main.py               # Application factory, CORS, static mounting
│
├── database/                 # Persistence & Storage Layer
│   ├── connection.py         # SQLAlchemy engine with PostgreSQL & SQLite fallback
│   ├── schema.sql            # Native PostgreSQL DDL schema with indexes
│   └── seed_data.py          # Realistic initial demo jobs and candidates
│
├── models/                   # Data Models
│   ├── db_models.py          # SQLAlchemy ORM database models
│   └── schemas.py            # Pydantic schemas for request/response serialization
│
├── services/                 # AI, NLP & Business Logic Services
│   ├── resume_parser.py      # PDF (pypdf) & DOCX (python-docx) extraction
│   ├── text_preprocessor.py  # Text cleansing, regex contact & experience detection
│   ├── skill_extractor.py    # Multi-domain skill taxonomy & token matching
│   ├── embedding_service.py  # Sentence Transformers with robust vectorizer fallback
│   ├── matching_service.py   # Semantic similarity & weighted composite matching
│   ├── evaluation_service.py # Status assignment (ACCEPT/REVIEW/REJECT) & rationales
│   ├── recommendation_service.py # Targeted learning paths & resource generation
│   └── explanation_service.py    # SHAP/LIME feature attributions & driver analysis
│
├── utils/                    # Core Utilities
│   ├── constants.py          # Skill taxonomies, weights, threshold definitions
│   └── file_handler.py       # File sanitization, MIME validation, disk storage
│
├── frontend/                 # Modern React Dashboard (Vite)
│   ├── src/
│   │   ├── components/       # UI Components: Dashboard, Create Job, Upload, Results, Modal, Explainability
│   │   ├── services/api.js   # Frontend REST API client
│   │   ├── App.jsx           # Main state management & view router
│   │   └── index.css         # Modern design tokens, glassmorphism, responsive layout
│   ├── package.json
│   └── vite.config.js
│
├── uploads/                  # Secure disk storage for candidate resume files
├── requirements.txt          # Python dependencies
├── .env.example              # Environment configuration template
└── README.md                 # Complete system documentation
```

---

## 3. Installation

### Prerequisites
- **Python**: 3.10 to 3.14
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: (Optional for production; system includes zero-configuration SQLite fallback)

### Step 1: Clone or navigate to the project directory
```bash
cd "Recuriement assistant system"
```

### Step 2: Install Python dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 3: Install Frontend dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 4. PostgreSQL Setup

Create a PostgreSQL database for the application:
```sql
CREATE DATABASE recruitment_db;
```

Optionally execute the DDL schema directly:
```bash
psql -U postgres -d recruitment_db -f database/schema.sql
```

*Note: The application automatically creates all tables upon startup via SQLAlchemy ORM.*

---

## 5. Backend Setup

Copy the environment template and adjust database credentials:
```bash
copy .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recruitment_db
APP_NAME=AI-Powered Intelligent Recruitment Assistance System
HOST=127.0.0.1
PORT=8000
DEBUG=True
UPLOAD_DIR=uploads
EMBEDDING_MODEL_NAME=all-MiniLM-L6-v2
```

> **Automatic Fallback Feature**: If a local PostgreSQL instance is not reachable, the database connection seamlessly falls back to `sqlite:///./recruitment.db`, allowing you to run, test, and demonstrate the entire application immediately.

---

## 6. Frontend Setup

The frontend is located in the `frontend/` directory.

To build the production bundle:
```bash
cd frontend
npm run build
```

---

## 7. Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/recruitment_db` | Primary PostgreSQL connection string |
| `APP_NAME` | `AI-Powered Intelligent Recruitment Assistance System` | Application title |
| `HOST` | `127.0.0.1` | API server bind host |
| `PORT` | `8000` | API server port |
| `DEBUG` | `True` | Debug flag |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded resume PDFs/DOCXs |
| `MAX_FILE_SIZE_MB` | `20` | Max file upload limit |
| `EMBEDDING_MODEL_NAME` | `all-MiniLM-L6-v2` | Hugging Face Sentence Transformer model |

---

## 8. How to Run the Application

You can start both backend and frontend concurrently in two separate terminal windows.

### Terminal 1: Run Backend API
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
- ReDoc Docs: `http://127.0.0.1:8000/redoc`

### Terminal 2: Run Frontend React App
```bash
cd frontend
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

## 9. API Endpoints Reference

### Jobs
- `POST /jobs`: Create a new job requisition with required skills and criteria.
- `GET /jobs`: Retrieve all job requisitions with applicant counts.
- `GET /jobs/{job_id}`: Retrieve details for a specific job.

### Resumes
- `POST /resumes/upload`: Multi-file upload for PDF and DOCX files. Automatically extracts text, identifies contact details, detects skills, and links to an optional job for immediate evaluation.

### Analysis & Matching
- `POST /analyze`: Execute AI matching analysis between candidates and a job requisition. Computes semantic embeddings, skill overlaps, and explainable feature contributions.

### Candidates
- `GET /candidates`: Filterable candidate directory (by `job_id`, `status` [ACCEPT/REVIEW/REJECT], or search query).
- `GET /candidates/{candidate_id}`: Comprehensive candidate profile including contact details, education, experience, extracted skills, evaluation breakdown, and recommendations.

### Dashboard & Analytics
- `GET /dashboard/stats`: Returns KPI metrics (Total Jobs, Total Candidates, Candidates Analyzed, Average Match Score, and status distribution).

---

## 10. AI / NLP Workflow & Explainability

```mermaid
graph TD
    A[Candidate Resume (PDF/DOCX)] --> B[services/resume_parser.py]
    B --> C[Cleaned Raw Text]
    C --> D[services/text_preprocessor.py]
    D --> E[Extracted Metadata: Name, Contact, Exp, Edu]
    C --> F[services/skill_extractor.py]
    F --> G[Categorized Skills]
    
    H[Job Requisition Description & Skills] --> I[services/embedding_service.py]
    C --> I
    I --> J[Cosine Semantic Similarity (40%)]
    
    G --> K[services/matching_service.py]
    H --> K
    K --> L[Skill Overlap Score (40%)]
    E --> M[Experience Alignment (10%)]
    E --> N[Education Fit (10%)]
    
    J & L & M & N --> O[Composite Match Percentage (0-100%)]
    O --> P[services/evaluation_service.py]
    P --> Q[Triage Status: ACCEPT / REVIEW / REJECT]
    P --> R[AI Executive Summary & Evidence Rationale]
    
    O --> S[services/explanation_service.py]
    S --> T[SHAP/LIME Feature Attribution Breakdown]
    
    K --> U[services/recommendation_service.py]
    U --> V[Skill Gap Learning Roadmaps & Courses]
```

### Explainability Details
- **Feature Attribution**: The system details how many points were earned out of the maximum available for each category (Skill Match, Semantic Similarity, Experience, Education).
- **Positive Drivers**: Highlights verified skills and experience that boosted candidate ranking.
- **Negative Penalties**: Pinpoints explicit prerequisite gaps that lowered the score.
- **Recruiter Decision Support**: Recruiter guidelines accompany every score to ensure ethical, transparent, and non-automated final hiring decisions.
