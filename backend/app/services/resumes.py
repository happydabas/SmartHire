import os
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.resumes import ResumeRepository
from app.models.resumes import Resume
from app.models.users import User, UserRole

# Configurable maximum file size (default 5MB) loaded from environment variables
MAX_RESUME_SIZE = int(os.getenv("MAX_RESUME_SIZE", 5 * 1024 * 1024))

class ResumeService:
    """
    Handles resume file storage and metadata persistence.
    Enforces file type, size, role access and replacement constraints.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.resume_repo = ResumeRepository()

    async def upload_resume(self, file: UploadFile, current_user: User) -> Resume:
        """
        Upload and store a PDF resume locally, updating database metadata.
        Deletes any previous resume file if present.
        """
        # 1. Enforce Role constraint
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to upload resumes."
            )
            
        # 2. Enforce File extension constraint
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF resume files are accepted."
            )
            
        # 3. Read content and validate file size limits
        contents = await file.read()
        file_size = len(contents)
        if file_size > MAX_RESUME_SIZE:
            max_mb = MAX_RESUME_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum permitted limit ({max_mb:.1f}MB)."
            )
            
        # 4. Remove previous storage file if existing
        existing_resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if existing_resume and existing_resume.file_path:
            if os.path.exists(existing_resume.file_path):
                try:
                    os.remove(existing_resume.file_path)
                except Exception:
                    pass
                    
        # 5. Save the PDF resume locally
        user_dir = Path("uploads/resumes") / f"user_{current_user.id}"
        user_dir.mkdir(parents=True, exist_ok=True)
        file_path = user_dir / "resume.pdf"
        
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # 6. Save or update database metadata record
        resume = await self.resume_repo.create_or_update_metadata(
            self.db,
            user_id=current_user.id,
            file_name=file.filename,
            file_path=str(file_path),
            file_size=file_size
        )
        return resume

    async def get_resume_metadata(self, current_user: User) -> Resume:
        """
        Fetch the resume metadata record for the current job seeker.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to retrieve resumes."
            )
            
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume or not resume.file_path:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume record not found."
            )
        return resume

    async def delete_resume(self, current_user: User) -> None:
        """
        Delete the stored resume file from disk and remove its database metadata.
        """
        if current_user.role != UserRole.JOBSEEKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Job Seekers are authorized to delete resumes."
            )
            
        resume = await self.resume_repo.get_by_user_id(self.db, user_id=current_user.id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume record not found."
            )
            
        # Remove local file
        if resume.file_path and os.path.exists(resume.file_path):
            try:
                os.remove(resume.file_path)
            except Exception:
                pass
                
        # Delete database record
        await self.resume_repo.delete(self.db, db_obj=resume)
