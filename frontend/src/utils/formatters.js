/**
 * Industry-standard canonical formatting utilities for technologies and job roles.
 */

// Conventional industry capitalization map for programming languages, frameworks, and tools
const CANONICAL_TECH_MAP = {
  "python": "Python",
  "fastapi": "FastAPI",
  "sql": "SQL",
  "power bi": "Power BI",
  "powerbi": "Power BI",
  "react": "React",
  "react.js": "React",
  "reactjs": "React",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "html": "HTML",
  "html5": "HTML",
  "css": "CSS",
  "css3": "CSS",
  "sass": "Sass",
  "scss": "Sass",
  "machine learning": "Machine Learning",
  "ml": "Machine Learning",
  "deep learning": "Deep Learning",
  "dl": "Deep Learning",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "node": "Node.js",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mongodb": "MongoDB",
  "docker": "Docker",
  "git": "Git",
  "github": "GitHub",
  "gitlab": "GitLab",
  "aws": "AWS",
  "azure": "Azure",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud platform": "Google Cloud Platform",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  "restful api": "REST APIs",
  "graphql": "GraphQL",
  "grpc": "gRPC",
  "redux": "Redux",
  "tailwind": "TailwindCSS",
  "tailwindcss": "TailwindCSS",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "vue.js": "Vue.js",
  "vue": "Vue.js",
  "angular": "Angular",
  "svelte": "Svelte",
  "sqlite": "SQLite",
  "redis": "Redis",
  "mysql": "MySQL",
  "nosql": "NoSQL",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "scipy": "SciPy",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "keras": "Keras",
  "scikit-learn": "Scikit-Learn",
  "sklearn": "Scikit-Learn",
  "spacy": "spaCy",
  "nltk": "NLTK",
  "hugging face": "Hugging Face",
  "huggingface": "Hugging Face",
  "nlp": "Natural Language Processing",
  "natural language processing": "Natural Language Processing",
  "llm": "LLMs",
  "llms": "LLMs",
  "large language models": "LLMs",
  "langchain": "LangChain",
  "llamaindex": "LlamaIndex",
  "shap": "SHAP",
  "lime": "LIME",
  "linux": "Linux",
  "bash": "Bash",
  "c++": "C++",
  "c#": "C#",
  "c": "C",
  "java": "Java",
  "php": "PHP",
  "ruby": "Ruby",
  "ruby on rails": "Ruby on Rails",
  "rails": "Ruby on Rails",
  "go": "Go",
  "golang": "Go",
  "rust": "Rust",
  "swift": "Swift",
  "kotlin": "Kotlin",
  "dart": "Dart",
  "r": "R",
  "jira": "Jira",
  "agile": "Agile",
  "scrum": "Scrum",
  "microservices": "Microservices",
  "system design": "System Design",
  "problem solving": "Problem Solving",
  "communication": "Communication",
  "leadership": "Leadership",
  "team collaboration": "Team Collaboration"
};

/**
 * Format technology and skill names using official conventional industry capitalization.
 * Preserves exact casing: HTML, CSS, SQL, JavaScript, FastAPI, Power BI, Node.js, etc.
 */
export function formatSkill(skill) {
  if (!skill) return "";
  const trimmed = String(skill).trim();
  const lower = trimmed.toLowerCase();
  
  if (CANONICAL_TECH_MAP[lower]) {
    return CANONICAL_TECH_MAP[lower];
  }

  // Preserve all-caps acronyms (e.g., ETL, SDK, API)
  if (trimmed === trimmed.toUpperCase() && trimmed.length <= 4 && !/[^a-zA-Z]/.test(trimmed)) {
    return trimmed;
  }

  // Capitalize words cleanly without altering special characters
  return trimmed
    .split(/\s+/)
    .map(word => {
      const upper = word.toUpperCase();
      if (["AI", "ML", "UI", "UX", "QA", "IT", "DB"].includes(upper)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

// Canonical job roles dictionary for natural, professional title capitalization
const KNOWN_ROLES_MAP = {
  "software developer": "Software Developer",
  "data analyst": "Data Analyst",
  "ai engineer": "AI Engineer",
  "frontend developer": "Frontend Developer",
  "backend developer": "Backend Developer",
  "full stack engineer": "Full Stack Engineer",
  "full stack developer": "Full Stack Developer",
  "fullstack developer": "Full Stack Developer",
  "cloud engineer": "Cloud Engineer",
  "devops engineer": "DevOps Engineer",
  "machine learning engineer": "Machine Learning Engineer",
  "ml engineer": "ML Engineer",
  "data scientist": "Data Scientist",
  "qa engineer": "QA Engineer",
  "product manager": "Product Manager",
  "ui/ux designer": "UI/UX Designer",
  "ui designer": "UI Designer",
  "ux designer": "UX Designer"
};

/**
 * Format job roles with natural, professional title capitalization.
 * Prevents "ai engineer" or "Ai Engineer" -> properly formats to "AI Engineer".
 * Prevents "frontend developer" -> "Frontend Developer".
 */
export function formatJobRole(role) {
  if (!role) return "";
  const trimmed = String(role).trim();
  const lower = trimmed.toLowerCase();

  if (KNOWN_ROLES_MAP[lower]) {
    return KNOWN_ROLES_MAP[lower];
  }

  const acronyms = new Set(["AI", "ML", "NLP", "UI", "UX", "QA", "IT", "HR", "SEO", "BI", "API", "CTO", "VP"]);
  const minorWords = new Set(["and", "or", "of", "in", "for", "the", "with", "at", "by", "to"]);

  return trimmed
    .split(/[\s-]+/)
    .map((word, idx) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) {
        return upper;
      }
      const lowerWord = word.toLowerCase();
      if (idx > 0 && minorWords.has(lowerWord)) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
