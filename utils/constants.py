"""
Application Constants and Taxonomies
"""

# Supported Evaluation Statuses
STATUS_ACCEPT = "ACCEPT"
STATUS_REVIEW = "REVIEW"
STATUS_REJECT = "REJECT"

# Thresholds for decision recommendation
THRESHOLD_ACCEPT = 75.0
THRESHOLD_REVIEW = 50.0

# Matching component weights (sum to 1.0)
WEIGHT_SEMANTIC_SIMILARITY = 0.40
WEIGHT_SKILL_MATCH = 0.40
WEIGHT_EXPERIENCE_MATCH = 0.10
WEIGHT_EDUCATION_MATCH = 0.10

# Comprehensive Skill Taxonomy for extraction and normalization
SKILL_TAXONOMY = {
    # Programming Languages
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "c": "C",
    "go": "Go",
    "golang": "Go",
    "ruby": "Ruby",
    "php": "PHP",
    "rust": "Rust",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "scala": "Scala",
    "r": "R",
    "dart": "Dart",
    "sql": "SQL",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "sass": "Sass",
    "scss": "Sass",

    # Frontend Frameworks & Libraries
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "svelte": "Svelte",
    "redux": "Redux",
    "tailwind": "TailwindCSS",
    "tailwindcss": "TailwindCSS",
    "bootstrap": "Bootstrap",
    "material-ui": "Material-UI",
    "mui": "Material-UI",
    "jquery": "jQuery",

    # Backend Frameworks
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "express": "Express.js",
    "express.js": "Express.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "nestjs": "NestJS",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "asp.net": "ASP.NET",
    ".net core": ".NET Core",
    "ruby on rails": "Ruby on Rails",
    "rails": "Ruby on Rails",
    "graphql": "GraphQL",
    "rest api": "REST APIs",
    "restful api": "REST APIs",
    "grpc": "gRPC",

    # Databases & Storage
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "sqlite": "SQLite",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "oracle": "Oracle DB",
    "sql server": "MS SQL Server",
    "prisma": "Prisma",
    "sqlalchemy": "SQLAlchemy",
    "power bi": "Power BI",
    "powerbi": "Power BI",

    # Cloud & DevOps
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI",
    "linux": "Linux",
    "bash": "Bash/Shell",
    "nginx": "Nginx",
    "apache": "Apache",

    # AI, ML & NLP
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "keras": "Keras",
    "scikit-learn": "Scikit-Learn",
    "spacy": "spaCy",
    "nltk": "NLTK",
    "huggingface": "Hugging Face",
    "sentence transformers": "Sentence Transformers",
    "llm": "LLMs",
    "large language models": "LLMs",
    "langchain": "LangChain",
    "llamaindex": "LlamaIndex",
    "shap": "SHAP",
    "lime": "LIME",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",

    # Tools, Methodologies & Soft Skills
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "jira": "Jira",
    "agile": "Agile/Scrum",
    "scrum": "Scrum",
    "tdd": "TDD",
    "microservices": "Microservices",
    "system design": "System Design",
    "problem solving": "Problem Solving",
    "communication": "Communication",
    "leadership": "Leadership",
    "teamwork": "Team Collaboration",
    "critical thinking": "Critical Thinking"
}

# Curated Learning & Upskilling Recommendations based on missing skills
RECOMMENDED_LEARNING_RESOURCES = {
    "FastAPI": {
        "title": "Modern High-Performance APIs with FastAPI",
        "provider": "Official FastAPI Documentation & Courses",
        "level": "Intermediate",
        "category": "Backend Engineering"
    },
    "Docker": {
        "title": "Containerization & Microservices with Docker",
        "provider": "Docker Mastery Bootcamp",
        "level": "Beginner to Intermediate",
        "category": "DevOps & Cloud"
    },
    "Kubernetes": {
        "title": "Production Kubernetes & Cluster Management",
        "provider": "CNCF Certified Kubernetes Administrator (CKA)",
        "level": "Advanced",
        "category": "DevOps & Cloud"
    },
    "AWS": {
        "title": "AWS Solutions Architect Certification Path",
        "provider": "Amazon Web Services Training",
        "level": "Intermediate",
        "category": "Cloud Computing"
    },
    "PostgreSQL": {
        "title": "High-Performance PostgreSQL & Query Optimization",
        "provider": "PostgreSQL Tutorial & Advanced Indexing",
        "level": "Intermediate",
        "category": "Databases"
    },
    "React.js": {
        "title": "Modern React with Hooks, Redux & Performance",
        "provider": "React Official & Advanced React Patterns",
        "level": "Intermediate",
        "category": "Frontend"
    },
    "TypeScript": {
        "title": "Enterprise TypeScript for Large Scale Applications",
        "provider": "TypeScript Deep Dive",
        "level": "Intermediate",
        "category": "Programming Languages"
    },
    "Machine Learning": {
        "title": "Machine Learning Specialization by Andrew Ng",
        "provider": "DeepLearning.AI / Coursera",
        "level": "Intermediate",
        "category": "AI / Data Science"
    },
    "Natural Language Processing": {
        "title": "Modern NLP with Hugging Face Transformers & spaCy",
        "provider": "Hugging Face Course",
        "level": "Advanced",
        "category": "AI / NLP"
    },
    "System Design": {
        "title": "Large Scale Distributed Systems Design",
        "provider": "Grokking Modern System Design",
        "level": "Advanced",
        "category": "Architecture"
    }
}
