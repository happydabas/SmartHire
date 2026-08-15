import logging
from typing import List, Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.notifications import Notification
from app.models.jobs import Job
from app.models.applications import Application

logger = logging.getLogger(__name__)

async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str
) -> Notification:
    """
    Creates and persists a single user-scoped notification.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        is_read=False
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification

async def notify_users(
    db: AsyncSession,
    user_ids: List[int],
    title: str,
    message: str
) -> List[Notification]:
    """
    Creates separate notification records for each user ID in user_ids.
    Deduplicates user_ids to ensure no duplicate notifications are created for the same user.
    """
    unique_ids: Set[int] = {uid for uid in user_ids if uid is not None}
    notifications = []
    for uid in unique_ids:
        notification = Notification(
            user_id=uid,
            title=title,
            message=message,
            is_read=False
        )
        db.add(notification)
        notifications.append(notification)
    if notifications:
        await db.commit()
        for n in notifications:
            await db.refresh(n)
    return notifications

async def notify_job_application(
    db: AsyncSession,
    application: Application,
    job: Job,
    candidate_name: str = "Candidate"
):
    """
    Triggers notifications for a new application submission:
    1. Candidate receives confirmation notification.
    2. Company owner and recruiters assigned to this specific job receive new application notification.
    """
    company_name = job.company.name if job and job.company else "the company"
    job_title = job.title if job else "the position"

    # 1. Candidate notification
    await create_notification(
        db=db,
        user_id=application.user_id,
        title="Application Submitted",
        message=f"Your application for {job_title} at {company_name} has been submitted."
    )

    # 2. Collect authorized recruiter recipients for this specific job
    recipient_ids = []
    if job and job.company and job.company.owner_id:
        recipient_ids.append(job.company.owner_id)
    
    if job and job.id:
        from app.models.job_recruiters import JobRecruiter
        jr_stmt = select(JobRecruiter.recruiter_id).where(JobRecruiter.job_id == job.id)
        jr_res = await db.execute(jr_stmt)
        for r_id in jr_res.scalars().all():
            if r_id:
                recipient_ids.append(r_id)

    recipient_ids = [uid for uid in recipient_ids if uid != application.user_id]

    await notify_users(
        db=db,
        user_ids=recipient_ids,
        title="New Application Received",
        message=f"New application received for {job_title} from {candidate_name}."
    )

async def notify_status_change(
    db: AsyncSession,
    application: Application,
    job: Job,
    new_status_or_stage: str,
    candidate_name: str = "Candidate"
):
    """
    Triggers notifications when an application status or stage changes:
    1. Candidate receives status update notification.
    2. Assigned recruiters & company owner receive update notification.
    """
    job_title = job.title if job else "the position"
    display_stage = str(new_status_or_stage).replace("_", " ").title()

    if str(new_status_or_stage).upper() == "REJECTED":
        cand_title = "Application Status Update"
        cand_msg = f"Your application for {job_title} was rejected."
    elif str(new_status_or_stage).upper() in ["SELECTED", "OFFER", "HIRED"]:
        cand_title = "Congratulations!"
        cand_msg = f"Congratulations! You have been selected for {job_title}."
    else:
        cand_title = "Application Status Changed"
        cand_msg = f"Your application for {job_title} has moved to {display_stage}."

    # 1. Candidate notification
    await create_notification(
        db=db,
        user_id=application.user_id,
        title=cand_title,
        message=cand_msg
    )

    # 2. Recruiter notification
    recipient_ids = []
    if job and job.company and job.company.owner_id:
        recipient_ids.append(job.company.owner_id)
    
    if job and job.id:
        from app.models.job_recruiters import JobRecruiter
        jr_stmt = select(JobRecruiter.recruiter_id).where(JobRecruiter.job_id == job.id)
        jr_res = await db.execute(jr_stmt)
        for r_id in jr_res.scalars().all():
            if r_id:
                recipient_ids.append(r_id)

    recipient_ids = [uid for uid in recipient_ids if uid != application.user_id]

    await notify_users(
        db=db,
        user_ids=recipient_ids,
        title="Application Stage Updated",
        message=f"{candidate_name}'s application for {job_title} has moved to {display_stage}."
    )

async def notify_job_assignment(
    db: AsyncSession,
    recruiter_id: int,
    job_title: str,
    is_assigned: bool = True
):
    """
    Notifies a recruiter when assigned or unassigned from a job listing.
    """
    if is_assigned:
        title = "Job Assignment"
        message = f"You have been assigned to {job_title} by the company owner."
    else:
        title = "Job Unassigned"
        message = f"You are no longer assigned to {job_title}."

    await create_notification(
        db=db,
        user_id=recruiter_id,
        title=title,
        message=message
    )

async def notify_invitation(
    db: AsyncSession,
    owner_id: int,
    invited_email: str,
    company_name: str,
    invited_user_id: Optional[int] = None
):
    """
    Notifies owner of invitation sent, and notifies invited user if they already have an account.
    """
    await create_notification(
        db=db,
        user_id=owner_id,
        title="Recruiter Invited",
        message=f"Invitation sent to {invited_email}."
    )

    if invited_user_id:
        await create_notification(
            db=db,
            user_id=invited_user_id,
            title="Company Invitation",
            message=f"You have been invited to join {company_name}."
        )

async def notify_recruiter_joined(
    db: AsyncSession,
    owner_id: int,
    recruiter_name: str,
    company_name: str
):
    """
    Notifies company owner when a recruiter accepts invitation and joins the company.
    """
    await create_notification(
        db=db,
        user_id=owner_id,
        title="Recruiter Joined",
        message=f"{recruiter_name} has accepted the invitation and joined {company_name}."
    )
