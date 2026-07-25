import os
import json
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.services.resumes import ResumeService
from app.ai.services.resume_parser_service import resume_parser_service
from app.ai.services.resume_analysis_service import resume_analysis_service
from app.schemas.resume_analysis import ResumeAnalysisSchema

logger = logging.getLogger("app.api.resume_analysis")

router = APIRouter()

def get_resume_service(db: AsyncSession = Depends(get_db)) -> ResumeService:
    return ResumeService(db)

async def ensure_analysis_history_table_exists(db: AsyncSession):
    try:
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS resume_analysis_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                resume_version VARCHAR(255) NOT NULL,
                overall_score INTEGER NOT NULL,
                analysis_data TEXT NOT NULL
            )
        """))
        await db.commit()
    except Exception as e:
        logger.warning("Postgres CREATE TABLE failed, trying SQLite syntax: %s", str(e))
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS resume_analysis_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resume_version VARCHAR(255) NOT NULL,
                    overall_score INTEGER NOT NULL,
                    analysis_data TEXT NOT NULL
                )
            """))
            await db.commit()
        except Exception as ex:
            logger.error("Failed to create resume_analysis_history table: %s", str(ex))

async def load_profile_text(current_user: User, db: AsyncSession) -> str:
    from app.services.profiles import ProfileService
    from app.services.skills import SkillService
    from app.services.education import EducationService
    from app.services.experience import ExperienceService

    profile_service = ProfileService(db)
    skill_service = SkillService(db)
    education_service = EducationService(db)
    experience_service = ExperienceService(db)

    # 1. Profile Bio
    try:
        profile = await profile_service.get_profile(current_user)
        bio = profile.bio or ""
        location = profile.location or ""
    except Exception:
        profile = None
        bio = ""
        location = ""

    if not profile:
        return ""

    # 2. Skills
    try:
        skills = await skill_service.get_skills_list(current_user)
        skills_str = ", ".join([s.skill_name for s in skills])
    except Exception:
        skills_str = ""

    # 3. Education
    try:
        education = await education_service.get_education_list(current_user)
        edu_list = [f"Degree: {e.degree}, School: {e.institution_name}, Field: {e.field_of_study}, Grade: {e.grade}" for e in education]
        edu_str = "\n".join(edu_list)
    except Exception:
        edu_str = ""

    # 4. Experience
    try:
        experience = await experience_service.get_experience_list(current_user)
        exp_list = [f"Title: {ex.job_title}, Company: {ex.company_name}, Description: {ex.description}" for ex in experience]
        exp_str = "\n".join(exp_list)
    except Exception:
        exp_str = ""

    text_parts = [
        f"Name: {current_user.name}",
        f"Email: {current_user.email}",
        f"Location: {location}",
        f"Professional Summary: {bio}",
        f"Associated Skills: {skills_str}",
        f"Education Timelines:\n{edu_str}",
        f"Experiences:\n{exp_str}"
    ]
    return "\n\n".join(text_parts)

@router.post("/run", response_model=ResumeAnalysisSchema)
async def run_resume_analysis(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers are authorized to trigger resume analysis."
        )

    # 1. Load resume file if it exists
    resume_text = ""
    resume_version = "SmartHire Database Profile"
    try:
        resume_meta = await resume_service.get_resume_metadata(current_user)
        if resume_meta and resume_meta.file_path and os.path.exists(resume_meta.file_path):
            with open(resume_meta.file_path, "rb") as rf:
                file_bytes = rf.read()
            resume_text = resume_parser_service.extract_text(file_bytes, resume_meta.file_name)
            resume_version = resume_meta.file_name
    except Exception:
        pass

    # 2. Load profile database details
    profile_text = await load_profile_text(current_user, db)

    # 3. Guard constraints
    if not resume_text and not profile_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile or upload a resume first."
        )

    await ensure_analysis_history_table_exists(db)

    # 4. Trigger Analysis
    try:
        analysis_result = await resume_analysis_service.analyze_details(resume_text, profile_text)
        
        # 5. Save run log history (Store serialized JSON stringified data)
        await db.execute(
            text("""
                INSERT INTO resume_analysis_history (user_id, resume_version, overall_score, analysis_data)
                VALUES (:user_id, :version, :score, :data)
            """),
            {
                "user_id": current_user.id,
                "version": resume_version,
                "score": analysis_result.overall_score,
                "data": analysis_result.model_dump_json()
            }
        )
        await db.commit()

        return analysis_result
    except Exception as e:
        logger.error("Analysis service failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Analysis trigger failed: {str(e)}"
        )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_analysis_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers can retrieve analysis history."
        )

    await ensure_analysis_history_table_exists(db)

    result = await db.execute(
        text("""
            SELECT id, resume_version, analysis_date, overall_score, analysis_data
            FROM resume_analysis_history
            WHERE user_id = :user_id
            ORDER BY analysis_date DESC
        """),
        {"user_id": current_user.id}
    )
    
    rows = result.fetchall()
    history_items = []
    for r in rows:
        history_items.append({
            "id": r[0],
            "resume_version": r[1],
            "analysis_date": r[2].isoformat() if r[2] else datetime.now(timezone.utc).isoformat(),
            "overall_score": r[3],
            "analysis_data": json.loads(r[4]) if r[4] else {}
        })
    return history_items

@router.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis_history_item(
    history_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers can delete analysis history."
        )

    await ensure_analysis_history_table_exists(db)

    # Verify authorization
    check = await db.execute(
        text("SELECT id FROM resume_analysis_history WHERE id = :id AND user_id = :user_id"),
        {"id": history_id, "user_id": current_user.id}
    )
    if not check.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis run log not found or unauthorized to delete."
        )

    await db.execute(
        text("DELETE FROM resume_analysis_history WHERE id = :id AND user_id = :user_id"),
        {"id": history_id, "user_id": current_user.id}
    )
    await db.commit()
