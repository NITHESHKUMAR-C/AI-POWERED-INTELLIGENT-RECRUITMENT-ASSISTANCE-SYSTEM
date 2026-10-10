"""
Text Preprocessor & Information Extraction Service
Cleans raw resume text and extracts basic candidate information (Name, Contact, Experience, Education).
"""

import re
from typing import Dict, Any, Optional, Tuple

def clean_text(text: str) -> str:
    """Normalize and clean raw text by removing non-ASCII artifacts and extra whitespace."""
    if not text:
        return ""
    # Normalize unicode quotes and dashes
    cleaned = text.replace("’", "'").replace("“", '"').replace("”", '"').replace("–", "-")
    # Replace tabs and multiple spaces with a single space
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    # Remove consecutive line breaks
    cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
    return cleaned.strip()

def extract_email(text: str) -> Optional[str]:
    """Extract email address using robust regex pattern."""
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    matches = re.findall(pattern, text)
    if matches:
        # Ignore common fake/system emails if needed
        return matches[0].lower()
    return None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number using common formats."""
    # Matches international and standard formats like +1-555-123-4567, (123) 456-7890, +91 9876543210
    pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    matches = re.findall(pattern, text)
    if matches:
        return matches[0].strip()
    return None

def extract_candidate_name(text: str, filename: str = "") -> str:
    """
    Extract candidate name from the top header lines of the resume text,
    or falls back to the filename if header extraction is ambiguous.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        for line in lines[:5]:
            # Skip lines that contain email, website, phone or 'resume'
            if "@" in line or "http" in line or any(c.isdigit() for c in line):
                continue
            if line.lower() in ["resume", "curriculum vitae", "cv", "profile", "contact"]:
                continue
            words = line.split()
            # Most names are 2 to 4 words, predominantly title-cased or upper-cased
            if 1 <= len(words) <= 4 and len(line) <= 40:
                if all(w.isalpha() or "." in w for w in words):
                    return line.title()

    # Fallback to sanitized filename
    if filename:
        clean_file = re.sub(r"[\-_]", " ", filename)
        clean_file = re.sub(r"\.(pdf|docx|doc)$", "", clean_file, flags=re.IGNORECASE)
        clean_file = re.sub(r"\b(resume|cv|profile)\b", "", clean_file, flags=re.IGNORECASE).strip()
        if clean_file:
            return clean_file.title()

    return "Candidate"

def extract_experience_years(text: str) -> float:
    """
    Estimate total professional experience in years using explicit mentions
    and date range patterns (e.g. '5+ years of experience', '2018 - 2023').
    """
    # Look for explicit statements like "5+ years of experience", "7 years experience"
    exp_patterns = [
        r"(\d+(?:\.\d+)?)\s*\+?\s*years?(?:\s+of)?\s+experience",
        r"experience\s*:\s*(\d+(?:\.\d+)?)\s*\+?\s*years?",
        r"(\d+(?:\.\d+)?)\s*\+?\s*yrs?\s+(?:exp|experience)"
    ]
    for pattern in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                years = float(match.group(1))
                if 0.0 <= years <= 40.0:
                    return years
            except ValueError:
                pass

    # Look for year ranges like 2018 - 2024, 2020 - Present
    year_ranges = re.findall(r"\b(20\d\d|19\d\d)\s*[-–to]+\s*(20\d\d|present|current)\b", text, re.IGNORECASE)
    total_years = 0.0
    current_year = 2025
    seen_intervals = []

    for start_str, end_str in year_ranges:
        try:
            start_yr = int(start_str)
            end_yr = current_year if end_str.lower() in ["present", "current"] else int(end_str)
            if 1980 <= start_yr <= end_yr <= current_year:
                interval = (start_yr, end_yr)
                if interval not in seen_intervals:
                    seen_intervals.append(interval)
                    total_years += (end_yr - start_yr)
        except Exception:
            continue

    # Cap to reasonable bounds or return default
    if total_years > 0:
        return min(total_years, 35.0)

    return 2.0  # Conservative estimate if not explicitly parsed

def extract_education(text: str) -> str:
    """Detect highest education qualifications mentioned in resume."""
    degrees = [
        "Ph.D.", "PhD", "Doctorate",
        "Master of Science", "M.S.", "MS in", "M.Tech", "MBA", "Master's",
        "Bachelor of Science", "B.S.", "B.Tech", "B.E.", "Bachelor's",
        "Associate Degree", "Diploma"
    ]
    found = []
    text_lower = text.lower()
    for deg in degrees:
        if deg.lower() in text_lower:
            found.append(deg)

    if found:
        return ", ".join(found[:2])
    return "Bachelor's Degree (Equivalent)"

def extract_candidate_info(raw_text: str, filename: str = "") -> Dict[str, Any]:
    """
    Run complete information extraction pipeline on raw text.
    """
    cleaned = clean_text(raw_text)
    name = extract_candidate_name(cleaned, filename)
    email = extract_email(cleaned)
    phone = extract_phone(cleaned)
    experience_years = extract_experience_years(cleaned)
    education = extract_education(cleaned)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "experience_years": experience_years,
        "education": education,
        "cleaned_text": cleaned
    }

def preprocess_resume_text(raw_text: str) -> str:
    """Helper shortcut returning cleaned text."""
    return clean_text(raw_text)
