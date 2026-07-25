import os
import time
import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.auth.dependencies import get_current_active_user
from app.ai.services.resume_parser_service import resume_parser_service
from app.schemas.parsed_resume import ParsedResumeSchema

logger = logging.getLogger("app.api.resume_parser")

router = APIRouter()

async def ensure_history_table_exists(db: AsyncSession):
    """
    Ensure the parsing history table exists in PostgreSQL or SQLite fallbacks.
    """
    try:
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS resume_parsing_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                resume_name VARCHAR(255) NOT NULL,
                upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) NOT NULL
            )
        """))
        await db.commit()
    except Exception as e:
        logger.warning("Postgres CREATE TABLE failed, trying SQLite auto-increment: %s", str(e))
        try:
            await db.execute(text("""
                CREATE TABLE IF NOT EXISTS resume_parsing_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    resume_name VARCHAR(255) NOT NULL,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) NOT NULL
                )
            """))
            await db.commit()
        except Exception as ex:
            logger.error("Failed to create resume_parsing_history table: %s", str(ex))

@router.post("/upload", response_model=ParsedResumeSchema)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers are authorized to upload and parse resumes."
        )

    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX resume formats are supported."
        )

    MAX_SIZE = 20 * 1024 * 1024 # 20MB
    contents = await file.read()
    file_size = len(contents)
    if file_size > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum permitted limit (20MB)."
        )

    await ensure_history_table_exists(db)

    try:
        extracted_text = resume_parser_service.extract_text(contents, file.filename)
    except ValueError as val_err:
        await db.execute(
            text("INSERT INTO resume_parsing_history (user_id, resume_name, status) VALUES (:user_id, :name, 'Failed')"),
            {"user_id": current_user.id, "name": file.filename}
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )

    try:
        parsed_resume = await resume_parser_service.parse_resume_text(extracted_text)
        
        await db.execute(
            text("INSERT INTO resume_parsing_history (user_id, resume_name, status) VALUES (:user_id, :name, 'Completed')"),
            {"user_id": current_user.id, "name": file.filename}
        )
        await db.commit()
        
        return parsed_resume
    except Exception as parse_err:
        await db.execute(
            text("INSERT INTO resume_parsing_history (user_id, resume_name, status) VALUES (:user_id, :name, 'Failed')"),
            {"user_id": current_user.id, "name": file.filename}
        )
        await db.commit()
        logger.error("AI Parser service failed: %s", str(parse_err))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI parsing failed: {str(parse_err)}"
        )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_parsing_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers can retrieve parsing history."
        )

    await ensure_history_table_exists(db)

    result = await db.execute(
        text("SELECT id, resume_name, upload_date, status FROM resume_parsing_history WHERE user_id = :user_id ORDER BY upload_date DESC"),
        {"user_id": current_user.id}
    )
    
    rows = result.fetchall()
    history_items = []
    for r in rows:
        history_items.append({
            "id": r[0],
            "resume_name": r[1],
            "upload_date": r[2].isoformat() if r[2] else datetime.now(timezone.utc).isoformat(),
            "status": r[3]
        })
    return history_items

@router.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parsing_history_item(
    history_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != UserRole.JOBSEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Job Seekers can delete parsing history."
        )

    await ensure_history_table_exists(db)

    check_item = await db.execute(
        text("SELECT id FROM resume_parsing_history WHERE id = :id AND user_id = :user_id"),
        {"id": history_id, "user_id": current_user.id}
    )
    if not check_item.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or unauthorized to delete."
        )

    await db.execute(
        text("DELETE FROM resume_parsing_history WHERE id = :id AND user_id = :user_id"),
        {"id": history_id, "user_id": current_user.id}
    )
    await db.commit()
