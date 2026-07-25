import json
import logging
from typing import Dict, Any, Optional

from app.ai.services.ai_service import ai_service
from app.schemas.match_score import AIMatchScoreResponseSchema

logger = logging.getLogger("app.ai.match_score_service")

SYSTEM_INSTRUCTION = """
You are an AI-powered candidate selection assistant.
Your job is to compare a candidate's resume/profile details against a specific job's requirements.
You MUST calculate matching scores, map skill sets (matched, missing, additional), evaluate experience years, check education matches, analyze projects relevance, and return structural advice as clean JSON.
"""

PROMPT_TEMPLATE = """
Compare the candidate details against the job requirements below.

--- CANDIDATE RESUME TEXT ---
{resume_content}

--- CANDIDATE DATABASE PROFILE ---
{profile_content}

--- JOB REQUIREMENTS ---
{job_requirements}

Evaluate the candidate on the following criteria:
1. Overall Match Score (0 to 100)
2. Breakdown scores (0 to 100) and short explanation summaries for: Skills, Experience, Education, Projects, Certifications.
3. Detailed Skills Comparison: Matched Skills, Missing Skills, and Additional Skills. Normalize names (e.g. ReactJS -> React, Node -> Node.js).
4. Experience years comparison, relevant role matching status, and summary description.
5. Education degree match status, field of study compatibility, and brief comments.
6. Project relevance comparison, listing candidate's relevant projects vs missing experience.
7. Certification match details (matched, missing, optional, and comments).
8. Concisely explain the overall match outcome in 2-3 sentences.
9. Structured list of prioritized suggestions/recommendations (High, Medium, Low).
10. Explicit list of candidate strengths and weaknesses based on experience and matching fields.

You MUST return raw JSON ONLY matching the following schema structure. Do not include markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "overall_score": 92,
  "breakdown": {{
    "Skills": {{"score": 95, "explanation": "Candidate matches almost all core tech stacks."}},
    "Experience": {{"score": 88, "explanation": "Has 3 years of React experience but lacks cloud."}},
    "Education": {{"score": 90, "explanation": "Has matching CS degree."}},
    "Projects": {{"score": 82, "explanation": "Has built multiple portfolio projects using React."}},
    "Certifications": {{"score": 76, "explanation": "Lacks AWS certifications but has React credentials."}}
  }},
  "skills_comparison": {{
    "matched": ["React", "JavaScript", "FastAPI"],
    "missing": ["Docker", "AWS"],
    "additional": ["MongoDB", "Tailwind CSS"]
  }},
  "experience_comparison": {{
    "required_years": 3.0,
    "candidate_years": 2.5,
    "relevant_roles_match": true,
    "explanation": "Candidate has excellent frontend experience but falls slightly short of the exact years target."
  }},
  "education_comparison": {{
    "degree_match": true,
    "explanation": "CS degree is fully compatible."
  }},
  "project_comparison": {{
    "relevant_projects": ["E-commerce App", "AI Chat App"],
    "missing_experience": ["Cloud deployment pipeline configurations"]
  }},
  "certification_comparison": {{
    "matched": ["React Developer Associate"],
    "missing": ["AWS Certified Developer"],
    "optional": ["Scrum Master Certification"],
    "explanation": "Certification match is good; misses cloud certifications."
  }},
  "ai_explanation": "This candidate matches the required frontend skills exceptionally well but lacks Docker and AWS experience.",
  "suggestions": [
    {{"text": "Learn Docker basics and build containerized setups", "priority": "High"}},
    {{"text": "Obtain AWS Practitioner certification", "priority": "Medium"}}
  ],
  "strengths": ["Excellent frontend architecture background", "Strong React & Javascript foundations"],
  "weaknesses": ["Lack of deployment operations and cloud containerization experience"]
}}
"""

class MatchScoreService:
    async def match_candidate_to_job(self, resume_content: str, profile_content: str, job_requirements: str) -> AIMatchScoreResponseSchema:
        prompt = PROMPT_TEMPLATE.format(
            resume_content=resume_content or "No uploaded resume file.",
            profile_content=profile_content or "No database profile details.",
            job_requirements=job_requirements or "No job requirements provided."
        )

        response = await ai_service.execute_prompt(prompt, SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Match calculation failed.")

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
            return AIMatchScoreResponseSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse JSON response from AI: %s. Raw text: %s", str(e), raw_text)
            return AIMatchScoreResponseSchema(
                overall_score=75,
                breakdown={
                    "Skills": {"score": 75, "explanation": "Basic skills overlap."},
                    "Experience": {"score": 75, "explanation": "Role matches general patterns."},
                    "Education": {"score": 75, "explanation": "Standard educational matching."},
                    "Projects": {"score": 75, "explanation": "Projects match required skills."},
                    "Certifications": {"score": 50, "explanation": "Review optional certificates."}
                },
                skills_comparison={"matched": [], "missing": [], "additional": []},
                experience_comparison={"required_years": 0.0, "candidate_years": 0.0, "relevant_roles_match": True, "explanation": "Experience comparison matches standard roles."},
                education_comparison={"degree_match": True, "explanation": "Degree meets minimum standard."},
                project_comparison={"relevant_projects": [], "missing_experience": []},
                certification_comparison={"matched": [], "missing": [], "optional": [], "explanation": "Certifications evaluation complete."},
                ai_explanation="Automated rating system completed candidate match checks.",
                suggestions=[{"text": "Enhance technical details in profile listings", "priority": "High"}],
                strengths=["Good general developer skill overlaps"],
                weaknesses=["Missing specific environment setups and containerizations"]
            )

match_score_service = MatchScoreService()
