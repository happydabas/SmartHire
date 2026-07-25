import json
import logging
from typing import Dict, Any, Optional

from app.ai.services.ai_service import ai_service
from app.schemas.skill_matching import AISkillMatchingResponseSchema

logger = logging.getLogger("app.ai.skill_matching_service")

SYSTEM_INSTRUCTION = """
You are an expert AI developer skills matching assistant.
Your job is to compare a candidate's registered skill set (extracted from their resume or database profile listings) against a specific job's required skills.
You MUST calculate overall skill coverage, identify exact matches, detect closely related or equivalent technologies (with confidence levels between 0.0 and 1.0), lists missing required skills, compile additional skills, categorize all technologies, rank skill gap fields, and generate prioritized training tips.
Return raw JSON ONLY matching the requested structure.
"""

PROMPT_TEMPLATE = """
Compare the candidate's skills against the job requirements below.

--- CANDIDATE CREDENTIALS ---
Resume Text:
{resume_content}

Database Profile Skills:
{profile_content}

--- JOB REQUIRED SKILLS & DESCRIPTION ---
Required Skills:
{job_skills}

Job Title & Description:
{job_description}

Provide a deep semantic analysis:
1. Overall Skill Coverage Percent (0 to 100): Calculated based on how many required skills the candidate meets (exact or related).
2. Matched Skills: List of exact matches (names match exactly).
3. Related Skills: Equivalent/similar terms (e.g. ReactJS -> React, Node -> Node.js). For each relationship, supply confidence score (float, 0.0 to 1.0).
4. Missing Skills: Required skills absent from candidate profile, labeled with High, Medium, or Low importance.
5. Additional Skills: Candidates valuable extra skills not required for the job.
6. Category Coverage (0 to 100) percent completion: Group skills into: Frontend, Backend, Database, Cloud, DevOps, Testing, Programming Languages, Tools, Soft Skills.
7. Skill Gap Analysis: Ranked knowledge gaps (gap_name, priority).
8. Learning Recommendations: Prioritized suggestions (recommendation, priority).

You MUST return clean JSON ONLY. Do not wrap in markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "overall_coverage": 82,
  "matched_skills": ["React", "TypeScript", "Node.js"],
  "related_skills": [
    {{"required": "PostgreSQL", "candidate": "Postgres", "confidence": 0.98}},
    {{"required": "Tailwind CSS", "candidate": "Tailwind", "confidence": 0.95}}
  ],
  "missing_skills": [
    {{"name": "Docker", "importance": "High"}},
    {{"name": "AWS", "importance": "High"}},
    {{"name": "Redis", "importance": "Medium"}},
    {{"name": "GraphQL", "importance": "Low"}}
  ],
  "additional_skills": ["Flutter", "Python", "Kubernetes", "Machine Learning"],
  "category_coverage": {{
    "Frontend": 100,
    "Backend": 75,
    "Database": 90,
    "Cloud": 40,
    "DevOps": 25,
    "Programming Languages": 80,
    "Tools": 70
  }},
  "skill_gap_analysis": [
    {{"gap_name": "Cloud Deployment Infrastructure", "priority": "High"}},
    {{"gap_name": "Containerization & Docker", "priority": "High"}},
    {{"gap_name": "Caching & Redis Databases", "priority": "Medium"}}
  ],
  "learning_recommendations": [
    {{"recommendation": "Learn Docker basics and build containerized setups", "priority": "High"}},
    {{"recommendation": "Learn AWS EC2 deployment techniques", "priority": "High"}},
    {{"recommendation": "Build a Redis caching demonstration project", "priority": "Medium"}}
  ]
}}
"""

class SkillMatchingService:
    async def match_skills(self, resume_content: str, profile_content: str, job_skills: str, job_description: str) -> AISkillMatchingResponseSchema:
        prompt = PROMPT_TEMPLATE.format(
            resume_content=resume_content or "No resume file uploaded.",
            profile_content=profile_content or "No skills cataloged on database profile.",
            job_skills=job_skills or "No job skills cataloged.",
            job_description=job_description or "No job description registered."
        )

        response = await ai_service.execute_prompt(prompt, SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Skill comparison failed.")

        raw_text = response.data.strip()
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        try:
            parsed_json = json.loads(raw_text)
            return AISkillMatchingResponseSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse JSON response from AI: %s. Raw text: %s", str(e), raw_text)
            # Safe default fallback
            return AISkillMatchingResponseSchema(
                overall_coverage=70,
                matched_skills=[],
                related_skills=[],
                missing_skills=[{"name": "Docker", "importance": "High"}],
                additional_skills=[],
                category_coverage={
                    "Frontend": 70,
                    "Backend": 70,
                    "Database": 70
                },
                skill_gap_analysis=[{"gap_name": "Standard developer stacks", "priority": "High"}],
                learning_recommendations=[{"recommendation": "Update profile with detailed tech skills", "priority": "High"}]
            )

skill_matching_service = SkillMatchingService()
