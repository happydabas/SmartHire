import pytest
import uuid
from decimal import Decimal
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.main import app
from app.models.users import User, UserRole, UserStatus
from app.models.companies import Company
from app.models.jobs import Job, JobType, ExperienceLevel, WorkMode, JobStatus
from app.models.saved_jobs import SavedJob
from app.auth.dependencies import get_current_active_user

@pytest.fixture
async def job_seeker_user(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Job Seeker User",
        email=f"seeker_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def another_job_seeker_user(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Another Job Seeker",
        email=f"seeker2_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def recruiter_user(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Recruiter User",
        email=f"recruiter_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.RECRUITER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_company(db_session: AsyncSession, recruiter_user):
    uid = uuid.uuid4().hex[:6]
    company = Company(
        company_code=f"COMP-{uid}",
        owner_id=recruiter_user.id,
        name="Test Tech Inc",
        industry="Technology",
        company_size="11-50",
        location="London"
    )
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)
    return company

@pytest.fixture
async def open_job(db_session: AsyncSession, test_company, recruiter_user):
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Software Engineer",
        description="Write beautiful Python code.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.OPEN,
        salary_min=Decimal("80000.00"),
        salary_max=Decimal("120000.00"),
        is_deleted=False
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job

@pytest.fixture
async def draft_job(db_session: AsyncSession, test_company, recruiter_user):
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Draft Engineer",
        description="Draft description.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.DRAFT,
        is_deleted=False
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job

@pytest.fixture
async def closed_job(db_session: AsyncSession, test_company, recruiter_user):
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Closed Engineer",
        description="Closed description.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.CLOSED,
        is_deleted=False
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job

@pytest.fixture
async def deleted_job(db_session: AsyncSession, test_company, recruiter_user):
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Deleted Engineer",
        description="Deleted description.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.OPEN,
        is_deleted=True
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job


def test_save_job_success(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    response = client.post(f"/api/v1/saved-jobs/{open_job.id}")
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["job_id"] == open_job.id
    assert data["user_id"] == job_seeker_user.id
    assert "id" in data

    app.dependency_overrides.pop(get_current_active_user, None)

def test_save_job_forbidden_for_non_job_seeker(client: TestClient, recruiter_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user

    response = client.post(f"/api/v1/saved-jobs/{open_job.id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.pop(get_current_active_user, None)

def test_save_job_not_found(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    response = client.post("/api/v1/saved-jobs/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_save_job_not_open(client: TestClient, job_seeker_user, draft_job, closed_job, deleted_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # 1. Draft job
    res1 = client.post(f"/api/v1/saved-jobs/{draft_job.id}")
    assert res1.status_code == status.HTTP_400_BAD_REQUEST

    # 2. Closed job
    res2 = client.post(f"/api/v1/saved-jobs/{closed_job.id}")
    assert res2.status_code == status.HTTP_400_BAD_REQUEST

    # 3. Soft-deleted job
    res3 = client.post(f"/api/v1/saved-jobs/{deleted_job.id}")
    assert res3.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_save_job_duplicate_prevented(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # First save
    res1 = client.post(f"/api/v1/saved-jobs/{open_job.id}")
    assert res1.status_code == status.HTTP_201_CREATED

    # Duplicate save
    res2 = client.post(f"/api/v1/saved-jobs/{open_job.id}")
    assert res2.status_code == status.HTTP_400_BAD_REQUEST

    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_saved_jobs_details(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Save the open job
    client.post(f"/api/v1/saved-jobs/{open_job.id}")

    # List saved jobs
    response = client.get("/api/v1/saved-jobs")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    job_details = data[0]
    
    assert job_details["id"] == open_job.id
    assert job_details["title"] == "Software Engineer"
    assert job_details["work_mode"] == "Remote"
    assert job_details["job_type"] == "Full-time"
    assert Decimal(job_details["salary_min"]) == Decimal("80000.00")
    assert Decimal(job_details["salary_max"]) == Decimal("120000.00")
    
    # Verify Company details included
    assert "company" in job_details
    assert job_details["company"]["name"] == "Test Tech Inc"
    
    # Verify Skills array included
    assert "skills" in job_details

    app.dependency_overrides.pop(get_current_active_user, None)

def test_unsave_job(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Save
    client.post(f"/api/v1/saved-jobs/{open_job.id}")

    # Delete
    response = client.delete(f"/api/v1/saved-jobs/{open_job.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify list is empty
    get_res = client.get("/api/v1/saved-jobs")
    assert len(get_res.json()) == 0

    app.dependency_overrides.pop(get_current_active_user, None)

def test_unsave_job_not_found(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Delete without saving
    response = client.delete(f"/api/v1/saved-jobs/{open_job.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_unsave_job_ownership_protection(client: TestClient, job_seeker_user, another_job_seeker_user, open_job):
    # User A saves
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    client.post(f"/api/v1/saved-jobs/{open_job.id}")

    # User B tries to delete User A's saved job mapping
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    response = client.delete(f"/api/v1/saved-jobs/{open_job.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)
