import datetime
from typing import Optional
from pydantic import Field

from app.schemas.base import BaseSchema

class ResumeMetadataResponse(BaseSchema):
    """Schema defining resume file upload metadata response structure."""
    id: int = Field(..., description="Unique resume identifier")
    user_id: int = Field(..., description="User ID of the job seeker")
    file_name: Optional[str] = Field(None, description="Original name of the uploaded PDF file")
    file_path: Optional[str] = Field(None, description="Local folder storage path")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    uploaded_at: Optional[datetime.datetime] = Field(None, description="Resume upload timestamp")
