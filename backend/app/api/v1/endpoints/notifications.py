import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update

from app.dependencies.db import get_db
from app.models.users import User
from app.models.notifications import Notification
from app.auth.dependencies import get_current_active_user
from app.schemas.notifications import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse
)

router = APIRouter()

@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    filter: str = Query("all", description="Filter by read status: all, unread, read"),
    search: Optional[str] = Query(None, description="Search query string"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Fetch paginated notifications strictly scoped to current_user.id.
    """
    base_stmt = select(Notification).where(Notification.user_id == current_user.id)

    if filter == "unread":
        base_stmt = base_stmt.where(Notification.is_read == False)
    elif filter == "read":
        base_stmt = base_stmt.where(Notification.is_read == True)

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        base_stmt = base_stmt.where(
            (Notification.title.ilike(search_term)) | (Notification.message.ilike(search_term))
        )

    # Total count query
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    # Unread count query
    unread_stmt = select(func.count()).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread_res = await db.execute(unread_stmt)
    unread_count = unread_res.scalar() or 0

    # Pagination calculation
    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1
    offset = (page - 1) * limit

    # Paginated query ordered by newest first
    items_stmt = base_stmt.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
    items_res = await db.execute(items_stmt)
    items = items_res.scalars().all()

    return NotificationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        unread_count=unread_count
    )

@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get unread notification count for current_user.id.
    """
    unread_stmt = select(func.count()).where(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    )
    unread_res = await db.execute(unread_stmt)
    unread_count = unread_res.scalar() or 0
    return UnreadCountResponse(unread_count=unread_count)

@router.patch("/{id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a single notification as read. Enforces user ownership.
    """
    stmt = select(Notification).where(
        Notification.id == id,
        Notification.user_id == current_user.id
    )
    res = await db.execute(stmt)
    notification = res.scalar_one_or_none()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied"
        )

    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return notification

@router.post("/read-all")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all unread notifications for current_user.id as read.
    """
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}

@router.delete("/{id}")
async def delete_notification(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a single notification. Enforces user ownership.
    """
    stmt = select(Notification).where(
        Notification.id == id,
        Notification.user_id == current_user.id
    )
    res = await db.execute(stmt)
    notification = res.scalar_one_or_none()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied"
        )

    await db.delete(notification)
    await db.commit()
    return {"success": True, "id": id}

@router.post("/delete-read")
async def delete_all_read_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete all read notifications for current_user.id.
    """
    stmt = (
        delete(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == True)
    )
    result = await db.execute(stmt)
    await db.commit()
    return {"success": True, "deleted_count": result.rowcount}
