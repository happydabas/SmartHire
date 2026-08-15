from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class NotificationBase(BaseModel):
    title: str = Field(..., max_length=150, description="Notification title")
    message: str = Field(..., description="Notification message content")

class NotificationCreate(NotificationBase):
    user_id: int = Field(..., description="Recipient user ID")

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    unread_count: int

class UnreadCountResponse(BaseModel):
    unread_count: int
