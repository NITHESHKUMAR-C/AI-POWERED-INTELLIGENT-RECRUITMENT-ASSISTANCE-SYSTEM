"""
Skill Extractor Service
Extracts technical and professional skills from resumes and job descriptions using taxonomy and NLP.
"""

import re
from typing import List, Dict, Any, Set
from utils.constants import SKILL_TAXONOMY

def build_regex_pattern(term: str) -> re.Pattern:
    """Builds a boundary-safe regular expression pattern for a skill term."""
    # Special handling for skills with non-alphanumeric characters like C++, C#, .NET, CI/CD
    escaped = re.escape(term)
    if term in ["c++", "c#", ".net", "c"]:
        # Match only when not preceded or followed by other word chars
        return re.compile(rf"(?:^|[\s,;/()\[\]])({escaped})(?:$|[\s,;/()\[\]])", re.IGNORECASE)
    else:
        return re.compile(rf"\b{escaped}\b", re.IGNORECASE)

# Precompile regexes for fast matching
COMPILED_PATTERNS = {
    canonical: [(raw_term, build_regex_pattern(raw_term)) for raw_term, canon in SKILL_TAXONOMY.items() if canon == canonical]
    for canonical in set(SKILL_TAXONOMY.values())
}

def extract_skills(text: str) -> List[Dict[str, Any]]:
    """
    Extracts all recognized skills from the text, returning canonical names,
    categories, and confidence scores.
    """
    if not text:
        return []

    found_skills: Dict[str, Dict[str, Any]] = {}
    lower_text = text.lower()

    # Try spaCy phrase matching if available, otherwise fast taxonomy regex
    for canonical_name, term_patterns in COMPILED_PATTERNS.items():
        for raw_term, pattern in term_patterns:
            if pattern.search(text) or (len(raw_term) > 3 and raw_term in lower_text):
                # Determine skill category
                category = get_skill_category(canonical_name)
                found_skills[canonical_name] = {
                    "skill_name": canonical_name,
                    "category": category,
                    "confidence_score": 0.95
                }
                break

    # Return sorted list of extracted skills
    return sorted(list(found_skills.values()), key=lambda x: x["skill_name"])

def get_skill_category(skill_name: str) -> str:
    """Categorize skill into domain groups."""
    categories = {
        "Programming Languages": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Ruby", "PHP", "Rust", "Swift", "Kotlin", "Scala", "R", "Dart", "SQL", "HTML5", "CSS3", "Sass"],
        "Frontend": ["React.js", "Next.js", "Vue.js", "Angular", "Svelte", "Redux", "TailwindCSS", "Bootstrap", "Material-UI", "jQuery"],
        "Backend & APIs": ["FastAPI", "Flask", "Django", "Express.js", "Node.js", "NestJS", "Spring Boot", "ASP.NET", ".NET Core", "Ruby on Rails", "GraphQL", "REST APIs", "gRPC"],
        "Databases": ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "Oracle DB", "MS SQL Server", "Prisma", "SQLAlchemy"],
        "Cloud & DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "Google Cloud Platform", "Terraform", "Ansible", "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "Linux", "Bash/Shell", "Nginx", "Apache"],
        "AI, ML & NLP": ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn", "spaCy", "NLTK", "Hugging Face", "Sentence Transformers", "LLMs", "LangChain", "LlamaIndex", "SHAP", "LIME", "Pandas", "NumPy", "SciPy"],
        "Practices & Soft Skills": ["Git", "GitHub", "GitLab", "Jira", "Agile/Scrum", "Scrum", "TDD", "Microservices", "System Design", "Problem Solving", "Communication", "Leadership", "Team Collaboration", "Critical Thinking"]
    }
    for cat, skills in categories.items():
        if skill_name in skills:
            return cat
    return "General"
