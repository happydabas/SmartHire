import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import sqlalchemy as sa

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.models.jobs import Job
from app.auth.dependencies import get_current_active_user
from app.services.resumes import ResumeService
from app.ai.services.resume_parser_service import resume_parser_service
from app.ai.services.match_score_service import match_score_service
from app.schemas.match_score import AIMatchScoreResponseSchema
from app.api.resume_analysis import load_profile_text

logger = logging.getLogger("app.api.match_score")

router = APIRouter()

def get_resume_service(db: AsyncSession = Depends(get_db)) -> ResumeService:
    return ResumeService(db)

async def ensure_match_score_table_exists(db: AsyncSession):
    try:
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS ai_match_scores (
                id SERIAL PRIMARY KEY,
                job_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                score INTEGER NOT NULL,
                match_data TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        await db.commit()
    except Exception as e:
        logger.warning("Postgres CREATE TABLE failed, trying SQLite syntax: %s", str(e))
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS ai_match_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    score INTEGER NOT NULL,
                    match_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            await db.commit()
        except Exception as ex:
            logger.error("Failed to create ai_match_scores table: %s", str(ex))

def compile_job_requirements_text(job: Job) -> str:
    skills_list = ", ".join([s.skill_name for s in job.skills])
    return f"""
Job Title: {job.title}
Contract Type: {job.job_type}
Experience Target: {job.experience_level}
Location Mode: {job.work_mode} in {job.location}
Required Skills Catalog: {skills_list}
Description & Responsibilities: {job.description}
"""

@router.post("/calculate", response_model=AIMatchScoreResponseSchema)
async def calculate_match_score(
    job_id: int,
    candidate_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service)
):
    # 1. Authorizations & RBAC guards
    target_candidate_id = current_user.id
    if current_user.role == UserRole.JOBSEEKER:
        if candidate_id is not None and candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Candidates are only authorized to query their own match scores."
            )
    else:
        # Recruiter, Admin, Company Owner can specify candidate
        if candidate_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="candidate_id is required for recruiter requests."
            )
        target_candidate_id = candidate_id

    # 2. Load candidate User details
    candidate_user = current_user
    if target_candidate_id != current_user.id:
        c_res = await db.execute(sa.select(User).where(User.id == target_candidate_id))
        candidate_user = c_res.scalar_one_or_none()
        if not candidate_user or candidate_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate user record not found."
            )

    # 3. Load Job record
    job_res = await db.execute(sa.select(Job).where(sa.and_(Job.id == job_id, Job.is_deleted == False)))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found."
        )

    # 4. Load candidate credentials (PDF resume text & profile text)
    resume_text = ""
    try:
        resume_meta = await resume_service.get_resume_metadata(candidate_user)
        if resume_meta and resume_meta.file_path and os.path.exists(resume_meta.file_path):
            with open(resume_meta.file_path, "rb") as rf:
                file_bytes = rf.read()
            resume_text = resume_parser_service.extract_text(file_bytes, resume_meta.file_name)
    except Exception:
        pass

    profile_text = await load_profile_text(candidate_user, db)

    # Guard constraints
    if not resume_text and not profile_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete candidate profile or upload resume first."
        )

    # 5. Compile job parameters
    job_requirements = compile_job_requirements_text(job)

    await ensure_match_score_table_exists(db)

    # 6. Execute match calculations
    try:
        match_result = await match_score_service.match_candidate_to_job(
            resume_content=resume_text,
            profile_content=profile_text,
            job_requirements=job_requirements
        )

        # 7. Upsert results into database tables
        existing_check = await db.execute(
            text("SELECT id FROM ai_match_scores WHERE job_id = :job_id AND user_id = :user_id"),
            {"job_id": job_id, "user_id": target_candidate_id}
        )
        existing_row = existing_check.first()
        if existing_row:
            await db.execute(
                text("""
                    UPDATE ai_match_scores
                    SET score = :score, match_data = :data, created_at = :now
                    WHERE id = :id
                """),
                {
                    "score": match_result.overall_score,
                    "data": match_result.model_dump_json(),
                    "now": datetime.now(timezone.utc),
                    "id": existing_row[0]
                }
            )
        else:
            await db.execute(
                text("""
                    INSERT INTO ai_match_scores (job_id, user_id, score, match_data)
                    VALUES (:job_id, :user_id, :score, :data)
                """),
                {
                    "job_id": job_id,
                    "user_id": target_candidate_id,
                    "score": match_result.overall_score,
                    "data": match_result.model_dump_json()
                }
            )
        await db.commit()

        return match_result
    except Exception as e:
        logger.error("MatchScore calculation run failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Match score service trigger failed: {str(e)}"
        )

@router.get("/job/{job_id}/candidate/{candidate_id}")
async def get_match_score_for_candidate(
    job_id: int,
    candidate_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    await ensure_match_score_table_exists(db)
    
    # Check permissions
    if current_user.role == UserRole.JOBSEEKER and candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )

    res = await db.execute(
        text("SELECT score, match_data FROM ai_match_scores WHERE job_id = :job_id AND user_id = :user_id"),
        {"job_id": job_id, "user_id": candidate_id}
    )
    row = res.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match score not yet calculated for this job and candidate."
        )
    return {
        "job_id": job_id,
        "user_id": candidate_id,
        "score": row[0],
        "match_data": json.loads(row[1]) if row[1] else {}
    }

@router.get("/job/{job_id}/rankings", response_model=List[Dict[str, Any]])
async def get_job_candidates_rankings(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters or admin are authorized to view job match rankings list."
        )

    await ensure_match_score_table_exists(db)

    result = await db.execute(
        text("""
            SELECT m.user_id, u.name, u.email, m.score, m.created_at
            FROM ai_match_scores m
            JOIN users u ON m.user_id = u.id
            WHERE m.job_id = :job_id
            ORDER BY m.score DESC
        """),
        {"job_id": job_id}
    )
    
    rows = result.fetchall()
    rankings = []
    for r in rows:
        rankings.append({
            "user_id": r[0],
            "candidate_name": r[1],
            "candidate_email": r[2],
            "score": r[3],
            "calculated_at": r[4].isoformat() if r[4] else datetime.now(timezone.utc).isoformat()
        })
    return rankings
