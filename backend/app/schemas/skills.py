from typing import List
from pydantic import Field

from app.schemas.base import BaseSchema

class SkillsAdd(BaseSchema):
    """Schema to validate payload for adding one or multiple existing skills."""
    skill_ids: List[int] = Field(..., min_length=1, description="List of master skill IDs to associate")

class SkillResponse(BaseSchema):
    """Schema defining response format for skills."""
    id: int
    skill_name: str
    category: str
