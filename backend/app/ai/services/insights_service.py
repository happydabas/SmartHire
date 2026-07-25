import json
import logging
from typing import Dict, Any, Optional

from app.ai.services.ai_service import ai_service
from app.schemas.insights import JobSeekerInsightsResponseSchema, RecruiterInsightsResponseSchema

logger = logging.getLogger("app.ai.insights_service")

JOBSEEKER_SYSTEM_INSTRUCTION = """
You are an expert AI career advisor.
You analyze candidate profile credentials (resume content, database profile details, applied history, and recommendation logs) and generate personalized insight reports.
You must return clean, structured JSON only.
"""

JOBSEEKER_PROMPT_TEMPLATE = """
Generate AI career insights for this job seeker.

--- RESUME TEXT ---
{resume_content}

--- PROFILE TECH SKILLS & DETAILS ---
{profile_content}

--- APPLICATION LOGS & HISTORY ---
{applications_summary}

--- RECENT RECOMMENDATIONS SUMMARY ---
{recommendations_summary}

Evaluate their profile metrics:
1. Resume Health:
   - `resume_strength` (0-100 score)
   - `ats_readiness` (0-100 score)
   - `profile_completeness` (0-100 score)
   - `improvement_tips`: List of objects containing `tip` and `priority` (High, Medium, Low).
2. Career Suggestions: List of objects containing `path` and `reason`.
3. Learning Roadmap: List of objects containing `skill`, `category`, and `impact_level` (High, Medium, Low).
4. Top Skills & Weak Skills list.

You MUST return raw JSON ONLY. Do not write markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "summary": "Your profile demonstrates a strong frontend foundation. We identified key areas to improve ATS readiness and container deployment skills.",
  "resume_health": {{
    "resume_strength": 85,
    "ats_readiness": 75,
    "profile_completeness": 90,
    "improvement_tips": [
      {{"tip": "Improve your professional summary to highlight achievements", "priority": "High"}},
      {{"tip": "Add quantifiable results to projects", "priority": "Medium"}}
    ]
  }},
  "career_suggestions": [
    {{"path": "Frontend Engineer", "reason": "Due to extensive React and frontend tech stacks."}}
  ],
  "learning_roadmap": [
    {{"skill": "Docker", "category": "DevOps", "impact_level": "High"}},
    {{"skill": "TypeScript", "category": "Programming Languages", "impact_level": "High"}}
  ],
  "top_skills": ["React", "JavaScript", "CSS"],
  "weak_skills": ["Docker", "AWS", "SQL"]
}}
"""

RECRUITER_SYSTEM_INSTRUCTION = """
You are an expert recruiter assistant.
You analyze hiring stats, applicant pipelines, and tech demands, and output structured insight summaries.
You must return clean, structured JSON only.
"""

RECRUITER_PROMPT_TEMPLATE = """
Generate recruitment AI insights.

--- JOB POSTINGS METRICS ---
{jobs_summary}

--- PIPELINE APPLICATION STATISTICS ---
{applications_summary}

--- AVAILABLE CANDIDATES SUMMARY ---
{candidates_summary}

Evaluate the recruitment pipeline:
1. Top Matching Candidates list (name, email, match_score, status).
2. Missing Skills frequently absent from applicant pools.
3. Average Match Score across all active applicants.
4. Most Applied Jobs list & Jobs Receiving Few Applications list.
5. Skill Demand list: list of objects containing `skill_name`, `demand_growth_percent`, and `trending_status` (High, Medium, Stable).
6. Hiring Recommendations: suggestions to improve applicant counts (e.g. increase salary, remote options).

You MUST return raw JSON ONLY. Do not write markdown codeblocks (no ```json ... ```).
JSON Structure:
{{
  "summary": "Hiring pipeline is active but showing missing cloud capabilities across candidate profiles.",
  "top_matching_candidates": [
    {{"name": "Alice Smith", "email": "alice@smarthire.com", "match_score": 95, "status": "SCREENING"}}
  ],
  "missing_skills": ["Docker", "Kubernetes", "Redis"],
  "average_match_score": 82,
  "most_applied_jobs": ["React Developer", "FastAPI Engineer"],
  "few_applications_jobs": ["DevOps Architect"],
  "skill_demand": [
    {{"skill_name": "Docker", "demand_growth_percent": 45, "trending_status": "High"}},
    {{"skill_name": "FastAPI", "demand_growth_percent": 30, "trending_status": "Medium"}}
  ],
  "hiring_recommendations": [
    {{"suggestion": "Consider adding remote work option for DevOps Architect", "reason": "DevOps roles typically attract 3x more applicants when work mode is remote.", "impact": "High"}}
  ]
}}
"""

class InsightsService:
    async def get_jobseeker_insights(
        self,
        resume_content: str,
        profile_content: str,
        applications_summary: str,
        recommendations_summary: str
    ) -> JobSeekerInsightsResponseSchema:
        prompt = JOBSEEKER_PROMPT_TEMPLATE.format(
            resume_content=resume_content or "No resume uploaded.",
            profile_content=profile_content or "No skills/profile listed.",
            applications_summary=applications_summary or "No applied jobs.",
            recommendations_summary=recommendations_summary or "No recent recommendations."
        )

        response = await ai_service.execute_prompt(prompt, JOBSEEKER_SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Job Seeker Insights failed.")

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
            return JobSeekerInsightsResponseSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse Job Seeker Insights JSON: %s. Raw: %s", str(e), raw_text)
            return JobSeekerInsightsResponseSchema(
                summary="Profile analyzed. Focus on expanding tech skills.",
                resume_health={"resume_strength": 75, "ats_readiness": 70, "profile_completeness": 80, "improvement_tips": []}
            )

    async def get_recruiter_insights(
        self,
        jobs_summary: str,
        applications_summary: str,
        candidates_summary: str
    ) -> RecruiterInsightsResponseSchema:
        prompt = RECRUITER_PROMPT_TEMPLATE.format(
            jobs_summary=jobs_summary or "No active postings.",
            applications_summary=applications_summary or "No pipeline applications.",
            candidates_summary=candidates_summary or "No matching candidates found."
        )

        response = await ai_service.execute_prompt(prompt, RECRUITER_SYSTEM_INSTRUCTION)
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Recruiter Insights failed.")

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
            return RecruiterInsightsResponseSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse Recruiter Insights JSON: %s. Raw: %s", str(e), raw_text)
            return RecruiterInsightsResponseSchema(
                summary="Recruiting metrics analyzed."
            )

insights_service = InsightsService()
