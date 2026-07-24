from datetime import datetime
from app.schemas.base import BaseSchema

class SavedJobResponse(BaseSchema):
    """Schema defining saved job response payload format."""
    id: int
    user_id: int
    job_id: int
    created_at: datetime
