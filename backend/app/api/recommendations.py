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
from app.ai.services.recommendation_service import recommendation_service
from app.schemas.recommendations import (
    AIRecommendationsOutputSchema,
    JobRecommendationResponseSchema,
    RecruiterRecommendationsPlaceholderSchema,
    CandidateRecommendationItemSchema,
    RecommendationHistoryItemSchema
)
from app.api.resume_analysis import load_profile_text

logger = logging.getLogger("app.api.recommendations")

router = APIRouter()

def get_resume_service(db: AsyncSession = Depends(get_db)) -> ResumeService:
    return ResumeService(db)

async def ensure_recommendations_history_table_exists(db: AsyncSession):
    try:
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS recommendation_history (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                job_id BIGINT NOT NULL,
                match_score INTEGER NOT NULL,
                reason TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        await db.commit()
    except Exception as e:
        logger.warning("Postgres CREATE TABLE failed, trying SQLite syntax: %s", str(e))
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS recommendation_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    job_id INTEGER NOT NULL,
                    match_score INTEGER NOT NULL,
                    reason TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            await db.commit()
        except Exception as ex:
            logger.error("Failed to create recommendation_history table: %s", str(ex))

@router.post("/refresh", response_model=AIRecommendationsOutputSchema)
async def refresh_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can receive personalized job recommendations."
        )

    await ensure_recommendations_history_table_exists(db)

    # 1. 30-Second Rate Limiter & Caching Check
    thirty_seconds_ago = datetime.now(timezone.utc) - timedelta(seconds=30)
    
    # Probe database dialect to query datetime checks safely
    dialect = db.bind.dialect.name
    if dialect == "sqlite":
        recent_check = await db.execute(
            text("""
                SELECT job_id, match_score, reason, created_at 
                FROM recommendation_history 
                WHERE user_id = :user_id AND datetime(created_at) > datetime(:thirty_ago)
                ORDER BY id DESC
            """),
            {"user_id": current_user.id, "thirty_ago": thirty_seconds_ago.isoformat()}
        )
    else:
        recent_check = await db.execute(
            text("""
                SELECT job_id, match_score, reason, created_at 
                FROM recommendation_history 
                WHERE user_id = :user_id AND created_at > :thirty_ago
                ORDER BY id DESC
            """),
            {"user_id": current_user.id, "thirty_ago": thirty_seconds_ago}
        )

    recent_rows = recent_check.fetchall()
    if len(recent_rows) > 0:
        # Return cached results from history table instead of calling LLM
        cached_recs = []
        for row in recent_rows:
            job_id, match_score, reason, _ = row
            # Fetch job info
            job_res = await db.execute(
                select(Job).where(Job.id == job_id, Job.is_deleted == False)
            )
            job = job_res.scalar_one_or_none()
            if job:
                cached_recs.append(JobRecommendationResponseSchema(
                    job_id=job.id,
                    title=job.title,
                    company_name=job.company.name if job.company else "Employer",
                    location=job.location,
                    salary=f"{job.location} | {job.job_type} | ${job.salary_min or 0} - ${job.salary_max or 0}",
                    match_score=match_score,
                    reason=reason,
                    confidence_score=0.9
                ))
        return AIRecommendationsOutputSchema(
            summary="Retrieved cached recommendations to prevent duplicate requests.",
            recommendations=cached_recs
        )

    # 2. Extract Candidate profile text & resumes
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

    # 3. Load Previously Applied & Saved Jobs list
    app_res = await db.execute(
        select(Application.job_id).where(Application.user_id == current_user.id)
    )
    applied_job_ids = [row[0] for row in app_res.fetchall()]

    save_res = await db.execute(
        select(SavedJob.job_id).where(SavedJob.user_id == current_user.id)
    )
    saved_job_ids = [row[0] for row in save_res.fetchall()]

    # 4. Load Open Jobs in catalog (exclude soft deleted)
    open_jobs_res = await db.execute(
        select(Job).where(Job.status == JobStatus.OPEN, Job.is_deleted == False).limit(30)
    )
    all_open_jobs = open_jobs_res.scalars().all()

    # Compile available jobs text representation
    available_jobs_text_list = []
    for j in all_open_jobs:
        skills_str = ", ".join([s.skill_name for s in j.skills])
        available_jobs_text_list.append(
            f"Job ID: {j.id} | Title: {j.title} | Company: {j.company.name if j.company else 'Employer'} | Location: {j.location} | Type: {j.job_type} | Required Skills: {skills_str}"
        )
    available_jobs_payload = "\n".join(available_jobs_text_list)

    # 5. Call AI Service recommendations
    ai_result = await recommendation_service.get_job_recommendations(
        resume_content=resume_text,
        profile_content=profile_text,
        preferred_location=current_user.profile.location if current_user.profile else "Any",
        preferred_job_type="Full-time",
        salary_preference="Market Rate",
        applied_jobs=", ".join(map(str, applied_job_ids)) or "None",
        saved_jobs=", ".join(map(str, saved_job_ids)) or "None",
        available_jobs=available_jobs_payload
    )

    # 6. Save Recommendations in history table
    for rec in ai_result.recommendations:
        await db.execute(
            text("""
                INSERT INTO recommendation_history (user_id, job_id, match_score, reason)
                VALUES (:user_id, :job_id, :score, :reason)
            """),
            {
                "user_id": current_user.id,
                "job_id": rec.job_id,
                "score": rec.match_score,
                "reason": rec.reason
            }
        )
    await db.commit()

    return ai_result

@router.get("/history", response_model=List[RecommendationHistoryItemSchema])
async def get_recommendation_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates have recommendation history."
        )

    await ensure_recommendations_history_table_exists(db)

    result = await db.execute(
        text("""
            SELECT h.id, h.job_id, j.title, c.name, h.match_score, h.reason, h.created_at
            FROM recommendation_history h
            JOIN jobs j ON h.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE h.user_id = :user_id
            ORDER BY h.id DESC
        """),
        {"user_id": current_user.id}
    )

    rows = result.fetchall()
    history = []
    for r in rows:
        history.append(RecommendationHistoryItemSchema(
            id=r[0],
            job_id=r[1],
            job_title=r[2],
            company_name=r[3],
            match_score=r[4],
            reason=r[5],
            created_at=r[6].isoformat() if r[6] else datetime.now(timezone.utc).isoformat()
        ))
    return history

@router.delete("/history")
async def clear_recommendation_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can clear history logs."
        )

    await ensure_recommendations_history_table_exists(db)

    await db.execute(
        text("DELETE FROM recommendation_history WHERE user_id = :user_id"),
        {"user_id": current_user.id}
    )
    await db.commit()
    return {"message": "Recommendation history cleared successfully."}

@router.get("/job/{job_id}/similar", response_model=List[Dict[str, Any]])
async def get_similar_jobs(
    job_id: int,
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch source job
    job_res = await db.execute(select(Job).where(Job.id == job_id, Job.is_deleted == False))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source job not found.")

    # 2. Match other jobs sharing same title substring or company or experience level
    words = job.title.split()
    conditions = [Job.id != job_id, Job.status == JobStatus.OPEN, Job.is_deleted == False]
    
    title_likes = [Job.title.ilike(f"%{w}%") for w in words if len(w) > 3]
    if title_likes:
        conditions.append(sa.or_(*title_likes))
    else:
        # Fallback to same experience level if no matching word in title
        conditions.append(Job.experience_level == job.experience_level)

    similar_res = await db.execute(
        select(Job).where(sa.and_(*conditions)).limit(8)
    )
    similar_jobs = similar_res.scalars().all()

    # If list is small, load any open jobs to fill similar slots up to 6-10 jobs
    if len(similar_jobs) < 6:
        extra_res = await db.execute(
            select(Job)
            .where(Job.id != job_id, Job.status == JobStatus.OPEN, Job.is_deleted == False)
            .limit(10 - len(similar_jobs))
        )
        similar_jobs.extend(extra_res.scalars().all())

    results = []
    for sj in similar_jobs:
        results.append({
            "id": sj.id,
            "title": sj.title,
            "company_name": sj.company.name if sj.company else "Employer",
            "location": sj.location,
            "job_type": sj.job_type,
            "salary_range": f"${sj.salary_min or 0} - ${sj.salary_max or 0}"
        })
    return results

@router.get("/trending", response_model=List[Dict[str, Any]])
async def get_trending_jobs(db: AsyncSession = Depends(get_db)):
    # Calculate trending jobs based on actual application volume counts
    trending_res = await db.execute(
        select(Job.id, Job.title, Job.location, Job.job_type, Job.salary_min, Job.salary_max, func.count(Application.id).label("app_count"))
        .select_from(Job)
        .outerjoin(Application, Job.id == Application.job_id)
        .where(Job.status == JobStatus.OPEN, Job.is_deleted == False)
        .group_by(Job.id, Job.title, Job.location, Job.job_type, Job.salary_min, Job.salary_max)
        .order_by(text("app_count DESC"))
        .limit(6)
    )

    rows = trending_res.fetchall()
    results = []
    for r in rows:
        # Load company relation details
        job_id = r[0]
        job_full_res = await db.execute(select(Job).where(Job.id == job_id))
        job_full = job_full_res.scalar_one_or_none()
        company_name = job_full.company.name if job_full and job_full.company else "Employer"

        results.append({
            "id": r[0],
            "title": r[1],
            "location": r[2],
            "job_type": r[3],
            "company_name": company_name,
            "salary_range": f"${r[4] or 0} - ${r[5] or 0}",
            "application_count": r[6]
        })
    return results

@router.get("/recruiter/job/{job_id}", response_model=RecruiterRecommendationsPlaceholderSchema)
async def recruiter_candidate_recommendations_placeholder(
    job_id: int,
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )

    # Returns a placeholder list of recommended candidates for recruiters
    placeholder_candidates = [
        CandidateRecommendationItemSchema(
            candidate_id=101,
            name="Alice Smith",
            email="alice@smarthire.com",
            match_score=95,
            reason="Alice has 4 years of React experience and matches the exact technology stacks required."
        ),
        CandidateRecommendationItemSchema(
            candidate_id=102,
            name="Bob Johnson",
            email="bob@smarthire.com",
            match_score=88,
            reason="Bob has strong backend experience using Python and FastAPI matching job specifications."
        )
    ]
    return RecruiterRecommendationsPlaceholderSchema(
        job_id=job_id,
        recommended_candidates=placeholder_candidates,
        message="AI Candidate Recommendations placeholder. Will recommend candidate list profiles in production."
    )
