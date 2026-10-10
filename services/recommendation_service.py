"""
Skill Gap and Upskilling Recommendation Service
Provides actionable career development roadmaps and curated learning resources for missing skills.
"""

from typing import List, Dict, Any
from utils.constants import RECOMMENDED_LEARNING_RESOURCES

def generate_skill_recommendations(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Generates actionable development recommendations and curated learning resources
    for each missing skill.
    """
    recommendations = []

    for idx, skill in enumerate(missing_skills):
        # Default priority: top 2 missing skills are HIGH, rest MEDIUM/LOW
        priority = "HIGH" if idx < 2 else ("MEDIUM" if idx < 4 else "LOW")

        # Check curated repository
        resource = RECOMMENDED_LEARNING_RESOURCES.get(skill)
        if resource:
            title = resource["title"]
            provider = resource["provider"]
            action = f"Complete guided projects and achieve competency certification in {skill} to bridge role prerequisites."
        else:
            title = f"{skill} Mastery & Real-World Application"
            provider = "Coursera / Udemy / Official Documentation"
            action = f"Build practical hands-on repositories and complete domain-specific tutorials covering {skill}."

        recommendations.append({
            "skill_name": skill,
            "priority": priority,
            "recommended_action": action,
            "learning_resource_title": title,
            "learning_provider": provider
        })

    return recommendations
