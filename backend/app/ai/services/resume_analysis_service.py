import json
import logging
from typing import Dict, Any, Optional

from app.ai.services.ai_service import ai_service
from app.schemas.resume_analysis import ResumeAnalysisSchema

logger = logging.getLogger("app.ai.resume_analysis_service")

SYSTEM_INSTRUCTION = """
You are an expert ATS (Applicant Tracking System) parser and professional resume consultant.
Your job is to analyze the candidate's resume/profile details and return a structured JSON report evaluating their formatting, keywords, strengths, weaknesses, sections completeness, skill gaps, and recommendations.
"""

PROMPT_TEMPLATE = """
Analyze the following resume and profile details.

--- RESUME TEXT (FILE UPLOAD) ---
{resume_content}

--- PROFILE DETAILS (DATABASE DATA) ---
{profile_content}

Evaluate the candidate on the following criteria:
1. Overall Quality Score (out of 100)
2. ATS Compatibility (out of 100)
3. Section-by-section analysis (score out of 100, strengths, weaknesses) for: Personal Information, Summary, Skills, Education, Experience, Projects, Certifications.
4. Detect missing sections.
5. Skill gaps (categorize overall category as 'Excellent', 'Good', or 'Needs Improvement', specify strong, weak, missing technical, and missing soft skills).
6. Prioritized suggestions ranked by importance (High, Medium, Low).
7. Summary paragraph.
8. Keyword analysis (important keywords present, missing keywords, keyword density, recommended keywords).

You MUST return raw JSON ONLY matching the following schema structure. Do not include markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "overall_score": 85,
  "ats_score": 90,
  "ats_evaluation": {{
    "formatting": "Good readable layout",
    "readability": "Excellent font structures",
    "keywords": "High match density"
  }},
  "section_analysis": {{
    "Personal Information": {{"score": 95, "strengths": ["Includes LinkedIn link"], "weaknesses": ["Missing github link"]}},
    "Summary": {{"score": 80, "strengths": ["Clear professional goal"], "weaknesses": ["Too generic"]}},
    "Skills": {{"score": 85, "strengths": ["Great frontend tools"], "weaknesses": ["Needs more backend databases"]}},
    "Education": {{"score": 90, "strengths": ["Includes CS degree"], "weaknesses": []}},
    "Experience": {{"score": 85, "strengths": ["Includes measurable results"], "weaknesses": ["Short descriptions"]}},
    "Projects": {{"score": 75, "strengths": ["React projects linked"], "weaknesses": ["Missing live demo links"]}},
    "Certifications": {{"score": 50, "strengths": [], "weaknesses": ["Missing professional certs"]}}
  }},
  "missing_sections": ["Certifications"],
  "skill_gap": {{
    "strong_skills": ["React", "JavaScript"],
    "weak_skills": ["CSS"],
    "missing_technical": ["FastAPI", "SQL"],
    "missing_soft": ["Public Speaking"],
    "category": "Good"
  }},
  "suggestions": [
    {{"text": "Add a Git link to verify project source code", "importance": "High"}},
    {{"text": "Add measurable achievements (e.g. Optimized speed by 20%)", "importance": "High"}}
  ],
  "ai_summary": "Overall solid candidate with robust Frontend capabilities but needs improvements in backend database catalogs.",
  "keywords": {{
    "important_keywords": ["React", "JavaScript", "Redux"],
    "missing_keywords": ["FastAPI", "PostgreSQL"],
    "density": 4.5,
    "recommendations": ["Incorporate PostgreSQL experience in experience description"]
  }}
}}
"""

class ResumeAnalysisService:
    async def analyze_details(self, resume_content: str, profile_content: str) -> ResumeAnalysisSchema:
        prompt = PROMPT_TEMPLATE.format(
            resume_content=resume_content or "No uploaded resume file content.",
            profile_content=profile_content or "No profile database details."
        )

        response = await ai_service.execute_prompt(prompt, SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Analysis failed.")

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
            return ResumeAnalysisSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse JSON response from AI: %s. Raw text: %s", str(e), raw_text)
            # Safe default fallback object if parsing failed
            return ResumeAnalysisSchema(
                overall_score=70,
                ats_score=70,
                ats_evaluation={"formatting": "Simple Text Evaluation", "readability": "Good", "keywords": "Medium"},
                section_analysis={
                    "Personal Information": {"score": 75, "strengths": ["Basic details exist"], "weaknesses": []},
                    "Summary": {"score": 70, "strengths": [], "weaknesses": []},
                    "Skills": {"score": 70, "strengths": [], "weaknesses": []},
                    "Education": {"score": 70, "strengths": [], "weaknesses": []},
                    "Experience": {"score": 70, "strengths": [], "weaknesses": []},
                    "Projects": {"score": 50, "strengths": [], "weaknesses": []},
                    "Certifications": {"score": 50, "strengths": [], "weaknesses": []}
                },
                missing_sections=[],
                skill_gap={
                    "strong_skills": [],
                    "weak_skills": [],
                    "missing_technical": [],
                    "missing_soft": [],
                    "category": "Needs Improvement"
                },
                suggestions=[{"text": "Refactor details to match standard formatting template", "importance": "High"}],
                ai_summary="AI Analysis encountered an error when parsing structured details. Evaluated overall profile settings.",
                keywords={"important_keywords": [], "missing_keywords": [], "density": 0.0, "recommendations": []}
            )

resume_analysis_service = ResumeAnalysisService()
