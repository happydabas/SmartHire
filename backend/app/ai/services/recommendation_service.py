import json
import logging
from typing import List, Dict, Any, Optional

from app.ai.services.ai_service import ai_service
from app.schemas.recommendations import AIRecommendationsOutputSchema

logger = logging.getLogger("app.ai.recommendation_service")

SYSTEM_INSTRUCTION = """
You are an expert career advisor and job recommendation AI.
Your job is to recommend the best job postings for a candidate based on their credentials compared against a list of available jobs.
You must return clean, structured JSON only.
"""

PROMPT_TEMPLATE = """
Recommend the best job postings for this candidate.

--- CANDIDATE INFORMATION ---
Resume Content:
{resume_content}

Database Profile Details:
{profile_content}

Preferred Location: {preferred_location}
Preferred Employment Type: {preferred_job_type}
Salary Preference: {salary_preference}

Previously Applied Jobs: {applied_jobs}
Saved Jobs: {saved_jobs}

--- AVAILABLE JOBS ---
{available_jobs}

Evaluate all available jobs for this candidate. Filter out jobs they have already applied to.
Rank the remaining jobs. For the top recommendations, output:
- `job_id`
- `title`
- `company_name`
- `location`
- `salary` (formatted string e.g. "50k - 80k")
- `match_score` (overall match percentage 0 to 100)
- `reason` (short explanation e.g. "Recommended because you have strong React and TypeScript experience.")
- `confidence_score` (between 0.0 and 1.0)

Provide a short textual summary explanation of the recommendations.

You MUST return raw JSON ONLY. Do not write markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "summary": "We found 2 jobs that perfectly align with your frontend profile and React background.",
  "recommendations": [
    {{
      "job_id": 12,
      "title": "Frontend Developer",
      "company_name": "ABC Technologies",
      "location": "Delhi",
      "salary": "Delhi, India | Full-time | $60,000 - $90,000",
      "match_score": 94,
      "reason": "Recommended because you have strong React and TypeScript experience.",
      "confidence_score": 0.96
    }}
  ]
}}
"""

class RecommendationService:
    async def get_job_recommendations(
        self,
        resume_content: str,
        profile_content: str,
        preferred_location: str,
        preferred_job_type: str,
        salary_preference: str,
        applied_jobs: str,
        saved_jobs: str,
        available_jobs: str
    ) -> AIRecommendationsOutputSchema:
        prompt = PROMPT_TEMPLATE.format(
            resume_content=resume_content or "No resume uploaded.",
            profile_content=profile_content or "No profile details.",
            preferred_location=preferred_location or "Any location",
            preferred_job_type=preferred_job_type or "Any job type",
            salary_preference=salary_preference or "Any salary target",
            applied_jobs=applied_jobs or "None",
            saved_jobs=saved_jobs or "None",
            available_jobs=available_jobs or "No open jobs in listings."
        )

        response = await ai_service.execute_prompt(prompt, SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Job Recommendation failed.")

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
            return AIRecommendationsOutputSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse JSON response from AI: %s. Raw text: %s", str(e), raw_text)
            # Safe default fallback
            return AIRecommendationsOutputSchema(
                summary="System analyzed jobs compared to profile metrics.",
                recommendations=[]
            )

recommendation_service = RecommendationService()
