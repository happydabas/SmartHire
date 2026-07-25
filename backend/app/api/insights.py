import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func
import sqlalchemy as sa

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.models.jobs import Job, JobStatus
from app.models.applications import Application
from app.models.saved_jobs import SavedJob
from app.auth.dependencies import get_current_active_user
from app.services.resumes import ResumeService
from app.ai.services.resume_parser_service import resume_parser_service
from app.ai.services.insights_service import insights_service
from app.schemas.insights import (
    JobSeekerInsightsResponseSchema,
    RecruiterInsightsResponseSchema,
    InsightHistoryItemSchema
)
from app.api.resume_analysis import load_profile_text

logger = logging.getLogger("app.api.insights")

router = APIRouter()

def get_resume_service(db: AsyncSession = Depends(get_db)) -> ResumeService:
    return ResumeService(db)

async def ensure_insights_history_table_exists(db: AsyncSession):
    try:
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS ai_insights_history (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                insight_type VARCHAR(50) NOT NULL,
                summary TEXT NOT NULL,
                insight_data TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        await db.commit()
    except Exception as e:
        logger.warning("Postgres CREATE TABLE failed, trying SQLite: %s", str(e))
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_insights_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    insight_type VARCHAR(50) NOT NULL,
                    summary TEXT NOT NULL,
                    insight_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            await db.commit()
        except Exception as ex:
            logger.error("Failed to create ai_insights_history table: %s", str(ex))

@router.post("/refresh")
async def refresh_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service)
):
    await ensure_insights_history_table_exists(db)

    # 1. 30-Second Rate Limiter & Caching Check
    thirty_seconds_ago = datetime.now(timezone.utc) - timedelta(seconds=30)
    insight_type = "seeker" if current_user.role == UserRole.JOBSEEKER else "recruiter"

    dialect = db.bind.dialect.name
    if dialect == "sqlite":
        recent_check = await db.execute(
            text("""
                SELECT insight_data FROM ai_insights_history
                WHERE user_id = :user_id AND insight_type = :type AND datetime(created_at) > datetime(:thirty_ago)
                ORDER BY id DESC LIMIT 1
            """),
            {"user_id": current_user.id, "type": insight_type, "thirty_ago": thirty_seconds_ago.isoformat()}
        )
    else:
        recent_check = await db.execute(
            text("""
                SELECT insight_data FROM ai_insights_history
                WHERE user_id = :user_id AND insight_type = :type AND created_at > :thirty_ago
                ORDER BY id DESC LIMIT 1
            """),
            {"user_id": current_user.id, "type": insight_type, "thirty_ago": thirty_seconds_ago}
        )

    recent_row = recent_check.first()
    if recent_row:
        # Return cached results directly
        return json.loads(recent_row[0])

    # 2. Seeker vs Recruiter insights pathways
    if current_user.role == UserRole.JOBSEEKER:
        # 2a. Seeker parameters compile
        resume_text = ""
        try:
            resume_meta = await resume_service.get_resume_metadata(current_user)
            if resume_meta and resume_meta.file_path and os.path.exists(resume_meta.file_path):
                with open(resume_meta.file_path, "rb") as rf:
                    file_bytes = rf.read()
                resume_text = resume_parser_service.extract_text(file_bytes, resume_meta.file_name)
        except Exception:
            pass

        profile_text = await load_profile_text(current_user, db)
        if not resume_text and not profile_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complete candidate profile or upload resume first."
            )

        # Retrieve applications logs summary
        app_res = await db.execute(
            select(Job.title, Job.location).join(Application, Job.id == Application.job_id).where(Application.user_id == current_user.id)
        )
        applied_list = [f"Job Applied: {row[0]} ({row[1]})" for row in app_res.fetchall()]

        # Retrieve saved jobs list
        save_res = await db.execute(
            select(Job.title).join(SavedJob, Job.id == SavedJob.job_id).where(SavedJob.user_id == current_user.id)
        )
        saved_list = [f"Job Saved: {row[0]}" for row in save_res.fetchall()]

        # Retrieve recommendations history
        rec_res = await db.execute(
            text("SELECT reason FROM recommendation_history WHERE user_id = :user_id LIMIT 5"),
            {"user_id": current_user.id}
        )
        recs_list = [row[0] for row in rec_res.fetchall()]

        seeker_result = await insights_service.get_jobseeker_insights(
            resume_content=resume_text,
            profile_content=profile_text,
            applications_summary=", ".join(applied_list + saved_list) or "None",
            recommendations_summary=", ".join(recs_list) or "None"
        )

        # Store in History Cache
        await db.execute(
            text("""
                INSERT INTO ai_insights_history (user_id, insight_type, summary, insight_data)
                VALUES (:user_id, :type, :sum, :data)
            """),
            {
                "user_id": current_user.id,
                "type": insight_type,
                "sum": seeker_result.summary,
                "data": seeker_result.model_dump_json()
            }
        )
        await db.commit()
        return seeker_result

    else:
        # 2b. Recruiter parameters compile
        # Retrieve recruiters' companies postings summary
        jobs_res = await db.execute(
            select(Job.id, Job.title, Job.status).where(Job.is_deleted == False)
        )
        jobs_list = [f"Job ID: {row[0]} | Title: {row[1]} | Status: {row[2]}" for row in jobs_res.fetchall()]

        # Retrieve applications pipeline details
        app_res = await db.execute(
            select(Job.title, Application.match_score).join(Application, Job.id == Application.job_id)
        )
        apps_list = [f"Application For: {row[0]} (Score: {row[1]})" for row in app_res.fetchall()]

        # Retrieve candidate pools counts
        cand_res = await db.execute(
            select(User.name, User.email).where(User.role == UserRole.JOBSEEKER).limit(10)
        )
        candidates_list = [f"Candidate: {row[0]} ({row[1]})" for row in cand_res.fetchall()]

        recruiter_result = await insights_service.get_recruiter_insights(
            jobs_summary="\n".join(jobs_list) or "None",
            applications_summary="\n".join(apps_list) or "None",
            candidates_summary="\n".join(candidates_list) or "None"
        )

        # Store in History Cache
        await db.execute(
            text("""
                INSERT INTO ai_insights_history (user_id, insight_type, summary, insight_data)
                VALUES (:user_id, :type, :sum, :data)
            """),
            {
                "user_id": current_user.id,
                "type": insight_type,
                "sum": recruiter_result.summary,
                "data": recruiter_result.model_dump_json()
            }
        )
        await db.commit()
        return recruiter_result

@router.get("/history", response_model=List[InsightHistoryItemSchema])
async def get_insights_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    await ensure_insights_history_table_exists(db)
    
    result = await db.execute(
        text("SELECT id, insight_type, summary, created_at FROM ai_insights_history WHERE user_id = :user_id ORDER BY id DESC"),
        {"user_id": current_user.id}
    )

    rows = result.fetchall()
    history = []
    for r in rows:
        history.append(InsightHistoryItemSchema(
            id=r[0],
            insight_type=r[1],
            summary=r[2],
            created_at=r[3].isoformat() if r[3] else datetime.now(timezone.utc).isoformat()
        ))
    return history

@router.delete("/history")
async def clear_insights_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    await ensure_insights_history_table_exists(db)
    await db.execute(
        text("DELETE FROM ai_insights_history WHERE user_id = :user_id"),
        {"user_id": current_user.id}
    )
    await db.commit()
    return {"message": "AI Insights history cleared successfully."}

@router.delete("/history/{insight_id}")
async def delete_insight_item(
    insight_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    await ensure_insights_history_table_exists(db)
    # Check item user bounds
    check = await db.execute(
        text("SELECT id FROM ai_insights_history WHERE id = :id AND user_id = :user_id"),
        {"id": insight_id, "user_id": current_user.id}
    )
    if not check.first():
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insight record not found.")

    await db.execute(
        text("DELETE FROM ai_insights_history WHERE id = :id"),
        {"id": insight_id}
    )
    await db.commit()
    return {"message": "Insight record deleted successfully."}
