import pytest
import uuid
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.users import User, UserRole, UserStatus
from app.models.companies import Company
from app.models.jobs import Job, JobType, WorkMode, JobStatus, ExperienceLevel
from app.models.notifications import Notification
from app.auth.dependencies import get_current_active_user
from app.services.notification_service import create_notification, notify_job_application, notify_status_change

@pytest.fixture
async def seeker_a(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Seeker A",
        email=f"seeker_a_{uid}@example.com",
        password="password123",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def seeker_b(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Seeker B",
        email=f"seeker_b_{uid}@example.com",
        password="password123",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def company_owner(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Company Owner",
        email=f"owner_{uid}@example.com",
        password="password123",
        role=UserRole.COMPANY_OWNER,
        status=UserStatus.ACTIVE,
        is_owner=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    company = Company(
        company_code=f"COMP-{uid}",
        owner_id=user.id,
        name="Test Corp",
        industry="Technology",
        company_size="11-50",
        location="London"
    )
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    user.company_id = company.id
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def recruiter_a(db_session: AsyncSession, company_owner: User):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Recruiter A",
        email=f"rec_a_{uid}@example.com",
        password="password123",
        role=UserRole.RECRUITER,
        status=UserStatus.ACTIVE,
        company_id=company_owner.company_id
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def recruiter_b(db_session: AsyncSession, company_owner: User):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Recruiter B",
        email=f"rec_b_{uid}@example.com",
        password="password123",
        role=UserRole.RECRUITER,
        status=UserStatus.ACTIVE,
        company_id=company_owner.company_id
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.anyio
async def test_job_seeker_notification_isolation(client: TestClient, db_session: AsyncSession, seeker_a: User, seeker_b: User):
    """
    Test Case 1: Job Seeker A has notification N1, Job Seeker B has notification N2.
    Job Seeker A must only see N1. Job Seeker B must only see N2.
    """
    n1 = await create_notification(db_session, user_id=seeker_a.id, title="Title N1", message="Message N1")
    n2 = await create_notification(db_session, user_id=seeker_b.id, title="Title N2", message="Message N2")

    # Logged in as Seeker A
    app.dependency_overrides[get_current_active_user] = lambda: seeker_a
    res_a = client.get("/api/v1/notifications")
    assert res_a.status_code == status.HTTP_200_OK
    data_a = res_a.json()
    items_a = data_a["items"]
    ids_a = [item["id"] for item in items_a]
    assert n1.id in ids_a
    assert n2.id not in ids_a

    # Logged in as Seeker B
    app.dependency_overrides[get_current_active_user] = lambda: seeker_b
    res_b = client.get("/api/v1/notifications")
    assert res_b.status_code == status.HTTP_200_OK
    data_b = res_b.json()
    items_b = data_b["items"]
    ids_b = [item["id"] for item in items_b]
    assert n2.id in ids_b
    assert n1.id not in ids_b

    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_cross_user_modification_denied(client: TestClient, db_session: AsyncSession, seeker_a: User, seeker_b: User):
    """
    Test Case 4 & 5: Seeker A attempts to mark read or delete Seeker B's notification.
    Expect HTTP 404/403 Access Denied.
    """
    n2 = await create_notification(db_session, user_id=seeker_b.id, title="Title N2", message="Message N2")

    app.dependency_overrides[get_current_active_user] = lambda: seeker_a

    # Mark as read
    read_res = client.patch(f"/api/v1/notifications/{n2.id}/read")
    assert read_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

    # Delete
    del_res = client.delete(f"/api/v1/notifications/{n2.id}")
    assert del_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_recruiter_job_assignment_notification_isolation(
    client: TestClient,
    db_session: AsyncSession,
    company_owner: User,
    recruiter_a: User,
    recruiter_b: User,
    seeker_a: User
):
    """
    Test Case 3: Recruiter A assigned to Job 1, Recruiter B assigned to Job 2.
    Application for Job 1 -> Recruiter A & Owner get notified; Recruiter B does NOT.
    """
    # Create Job 1 assigned to Recruiter A
    job1 = Job(
        title="Job 1 Backend Developer",
        description="Job 1 description",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        location="Remote",
        company_id=company_owner.company_id,
        recruiter_id=company_owner.id,
        status=JobStatus.OPEN
    )
    db_session.add(job1)
    await db_session.commit()
    await db_session.refresh(job1)

    from app.models.job_recruiters import JobRecruiter
    jr1 = JobRecruiter(job_id=job1.id, recruiter_id=recruiter_a.id)
    db_session.add(jr1)
    await db_session.commit()

    # Create dummy application for Job 1
    from app.models.applications import Application, ApplicationStatus
    app1 = Application(
        user_id=seeker_a.id,
        job_id=job1.id,
        status=ApplicationStatus.APPLIED
    )
    db_session.add(app1)
    await db_session.commit()

    # Dispatch application notification
    await notify_job_application(db_session, application=app1, job=job1, candidate_name=seeker_a.name)

    # Recruiter A sees notification
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_a
    res_a = client.get("/api/v1/notifications")
    assert res_a.status_code == status.HTTP_200_OK
    data_a = res_a.json()
    assert any("Job 1" in item["message"] or "Job 1" in item["title"] for item in data_a["items"])

    # Recruiter B does NOT see notification
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_b
    res_b = client.get("/api/v1/notifications")
    assert res_b.status_code == status.HTTP_200_OK
    data_b = res_b.json()
    assert not any("Job 1" in item["message"] or "Job 1" in item["title"] for item in data_b["items"])

    # Company Owner DOES see notification
    app.dependency_overrides[get_current_active_user] = lambda: company_owner
    res_owner = client.get("/api/v1/notifications")
    assert res_owner.status_code == status.HTTP_200_OK
    data_owner = res_owner.json()
    assert any("Job 1" in item["message"] or "Job 1" in item["title"] for item in data_owner["items"])

    app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_bulk_operations_user_scoped(client: TestClient, db_session: AsyncSession, seeker_a: User, seeker_b: User):
    """
    Test Case 6: Mark all read and Delete read operations only affect current_user.id.
    """
    n_a1 = await create_notification(db_session, user_id=seeker_a.id, title="A1", message="A1")
    n_b1 = await create_notification(db_session, user_id=seeker_b.id, title="B1", message="B1")

    # Logged in as Seeker A -> mark all read
    app.dependency_overrides[get_current_active_user] = lambda: seeker_a
    res_read_all = client.post("/api/v1/notifications/read-all")
    assert res_read_all.status_code == status.HTTP_200_OK

    # Verify Seeker B's notification is STILL unread
    await db_session.refresh(n_b1)
    assert n_b1.is_read is False

    # Delete read notifications for Seeker A
    res_del_read = client.post("/api/v1/notifications/delete-read")
    assert res_del_read.status_code == status.HTTP_200_OK

    # Seeker B's notification remains intact
    app.dependency_overrides[get_current_active_user] = lambda: seeker_b
    res_b = client.get("/api/v1/notifications")
    assert res_b.status_code == status.HTTP_200_OK
    items_b = res_b.json()["items"]
    assert any(item["id"] == n_b1.id for item in items_b)

    app.dependency_overrides.clear()
