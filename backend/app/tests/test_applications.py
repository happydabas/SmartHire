import pytest
import uuid
import datetime
from decimal import Decimal
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.users import User, UserRole, UserStatus
from app.models.companies import Company
from app.models.jobs import Job, JobType, ExperienceLevel, WorkMode, JobStatus
from app.models.profiles import JobSeekerProfile
from app.models.resumes import Resume
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

    # Add profile
    profile = JobSeekerProfile(
        user_id=user.id,
        full_name="John Doe",
        phone_number="1234567890",
        date_of_birth=datetime.date(1995, 1, 1),
        gender="Male",
        address="123 Street",
        city="London",
        state="London",
        country="UK"
    )
    # Add resume
    resume = Resume(
        user_id=user.id,
        file_name="resume.pdf",
        file_path="/path/to/resume.pdf",
        file_size=1024
    )
    db_session.add(profile)
    db_session.add(resume)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def job_seeker_without_profile(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Job Seeker No Profile",
        email=f"noprofile_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    # Add resume only
    resume = Resume(
        user_id=user.id,
        file_name="resume.pdf",
        file_path="/path/to/resume.pdf",
        file_size=1024
    )
    db_session.add(resume)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def job_seeker_without_resume(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Job Seeker No Resume",
        email=f"noresume_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.JOBSEEKER,
        status=UserStatus.ACTIVE
    )
    db_session.add(user)
    await db_session.commit()
    # Add profile only
    profile = JobSeekerProfile(
        user_id=user.id,
        full_name="John Doe",
        phone_number="1234567890",
        date_of_birth=datetime.date(1995, 1, 1),
        gender="Male",
        address="123 Street",
        city="London",
        state="London",
        country="UK"
    )
    db_session.add(profile)
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

    # Add profile
    profile = JobSeekerProfile(
        user_id=user.id,
        full_name="Another Jane",
        phone_number="0987654321",
        date_of_birth=datetime.date(1996, 2, 2),
        gender="Female",
        address="456 Avenue",
        city="London",
        state="London",
        country="UK"
    )
    # Add resume
    resume = Resume(
        user_id=user.id,
        file_name="resume2.pdf",
        file_path="/path/to/resume2.pdf",
        file_size=2048
    )
    db_session.add(profile)
    db_session.add(resume)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def company_owner_user(db_session: AsyncSession):
    uid = uuid.uuid4().hex[:6]
    user = User(
        name="Company Owner User",
        email=f"owner_{uid}@example.com",
        password="fakehashedpassword",
        role=UserRole.COMPANY_OWNER,
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
async def open_job_b(db_session: AsyncSession, test_company, recruiter_user):
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Frontend Engineer",
        description="Write React code.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.OPEN,
        salary_min=Decimal("70000.00"),
        salary_max=Decimal("110000.00"),
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
async def expired_job(db_session: AsyncSession, test_company, recruiter_user):
    from datetime import datetime, timedelta, timezone
    job = Job(
        company_id=test_company.id,
        recruiter_id=recruiter_user.id,
        title="Expired Engineer",
        description="Expired description.",
        location="Remote",
        job_type=JobType.FULL_TIME,
        experience_level=ExperienceLevel.MID,
        work_mode=WorkMode.REMOTE,
        status=JobStatus.OPEN,
        application_deadline=datetime.now(timezone.utc) - timedelta(days=1),
        is_deleted=False
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)
    return job


def test_apply_to_job_success(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": open_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["job_id"] == open_job.id
    assert data["user_id"] == job_seeker_user.id
    assert data["status"] == "APPLIED"
    assert "id" in data
    assert "applied_at" in data

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_forbidden_for_non_job_seeker(client: TestClient, recruiter_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user

    payload = {"job_id": open_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_not_found(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": 99999}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_duplicate_prevented(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": open_job.id}
    
    # First application
    res1 = client.post("/api/v1/applications", json=payload)
    assert res1.status_code == status.HTTP_201_CREATED

    # Duplicate application
    res2 = client.post("/api/v1/applications", json=payload)
    assert res2.status_code == status.HTTP_409_CONFLICT
    assert "You have already applied for this job" in res2.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_closed_job_prevented(client: TestClient, job_seeker_user, closed_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": closed_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Job is not open" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_draft_job_prevented(client: TestClient, job_seeker_user, draft_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": draft_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Job is not open" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_expired_job_prevented(client: TestClient, job_seeker_user, expired_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {"job_id": expired_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Job has expired" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_missing_profile_prevented(client: TestClient, job_seeker_without_profile, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_without_profile

    payload = {"job_id": open_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Complete your profile before applying" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_missing_resume_prevented(client: TestClient, job_seeker_without_resume, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_without_resume

    payload = {"job_id": open_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "A valid resume is required" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_to_job_unauthorized(client: TestClient, open_job):
    # No dependency override means no token provided
    payload = {"job_id": open_job.id}
    response = client.post("/api/v1/applications", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_apply_different_jobs_by_same_user(client: TestClient, job_seeker_user, open_job, open_job_b):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Apply to Job A
    res1 = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res1.status_code == status.HTTP_201_CREATED

    # Apply to Job B
    res2 = client.post("/api/v1/applications", json={"job_id": open_job_b.id})
    assert res2.status_code == status.HTTP_201_CREATED

    app.dependency_overrides.pop(get_current_active_user, None)

def test_apply_same_job_by_different_users(client: TestClient, job_seeker_user, another_job_seeker_user, open_job):
    # User A applies to Job A
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res1 = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res1.status_code == status.HTTP_201_CREATED
    app.dependency_overrides.pop(get_current_active_user, None)

    # User B applies to Job A
    # Since we need another_job_seeker_user to have profile and resume completed:
    # Let's override details on the fly or ensure the fixture handles it.
    # Note: another_job_seeker_user doesn't have resume, so let's make it have a profile & resume
    # We can create resume & profile for another_job_seeker_user here
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    res2 = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res2.status_code == status.HTTP_201_CREATED
    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_details_candidate_success(client: TestClient, db_session: AsyncSession, job_seeker_user, open_job):
    # 1. Create an application first
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    payload = {"job_id": open_job.id}
    res_create = client.post("/api/v1/applications", json=payload)
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]

    # 2. Retrieve details
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_200_OK
    data = res_get.json()
    assert data["application_id"] == app_id
    assert data["status"] == "APPLIED"
    assert data["job"]["job_title"] == open_job.title
    assert data["job"]["company_name"] == open_job.company.name
    assert data["candidate"]["candidate_name"] == job_seeker_user.name
    assert data["resume"]["resume_file_name"] == "resume.pdf"
    
    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_details_candidate_forbidden(client: TestClient, db_session: AsyncSession, job_seeker_user, another_job_seeker_user, open_job):
    # 1. User A applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. User B tries to view details
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

async def test_get_application_details_recruiter_success(client: TestClient, db_session: AsyncSession, job_seeker_user, recruiter_user, test_company, open_job):
    # Set recruiter's company_id
    recruiter_user.company_id = test_company.id
    db_session.add(recruiter_user)
    await db_session.commit()

    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Recruiter retrieves details
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_200_OK
    assert res_get.json()["application_id"] == app_id
    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_details_recruiter_forbidden(client: TestClient, db_session: AsyncSession, job_seeker_user, recruiter_user, open_job):
    # Recruiter has company_id = None or belongs to another company, so access is forbidden
    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Recruiter tries to retrieve details
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

async def test_get_application_details_company_owner_success(client: TestClient, db_session: AsyncSession, job_seeker_user, company_owner_user, test_company, open_job):
    # Set owner of company
    test_company.owner_id = company_owner_user.id
    db_session.add(test_company)
    await db_session.commit()

    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Company Owner retrieves details
    app.dependency_overrides[get_current_active_user] = lambda: company_owner_user
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_200_OK
    assert res_get.json()["application_id"] == app_id
    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_details_company_owner_forbidden(client: TestClient, db_session: AsyncSession, job_seeker_user, company_owner_user, open_job):
    # Owner does not own the company hosting this job
    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Owner tries to retrieve details
    app.dependency_overrides[get_current_active_user] = lambda: company_owner_user
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_history_success(client: TestClient, job_seeker_user, open_job, open_job_b):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Apply to two jobs
    client.post("/api/v1/applications", json={"job_id": open_job.id})
    client.post("/api/v1/applications", json={"job_id": open_job_b.id})

    # Retrieve history
    response = client.get("/api/v1/applications/history?page=1&limit=10")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total"] == 2
    assert len(data["items"]) == 2

    # Verify latest first sorting order
    assert data["items"][0]["job"]["title"] == open_job_b.title
    assert data["items"][1]["job"]["title"] == open_job.title

    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_history_forbidden_for_recruiter(client: TestClient, recruiter_user):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user

    response = client.get("/api/v1/applications/history")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "Only Job Seekers" in response.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

def test_get_application_history_invalid_pagination(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Test negative limit
    res_neg_limit = client.get("/api/v1/applications/history?limit=-5")
    assert res_neg_limit.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Test zero page
    res_zero_page = client.get("/api/v1/applications/history?page=0")
    assert res_zero_page.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    app.dependency_overrides.pop(get_current_active_user, None)

def test_withdraw_application_success(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # 1. Apply to job
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]

    # 2. Withdraw application
    res_withdraw = client.delete(f"/api/v1/applications/{app_id}")
    assert res_withdraw.status_code == status.HTTP_200_OK
    assert res_withdraw.json()["status"] == "WITHDRAWN"
    assert res_withdraw.json()["application_id"] == app_id
    assert "withdrawn successfully" in res_withdraw.json()["message"]

    # Verify status is withdrawn in database
    res_get = client.get(f"/api/v1/applications/{app_id}")
    assert res_get.status_code == status.HTTP_200_OK
    assert res_get.json()["status"] == "WITHDRAWN"

    app.dependency_overrides.pop(get_current_active_user, None)

def test_withdraw_application_forbidden_for_other_candidate(client: TestClient, job_seeker_user, another_job_seeker_user, open_job):
    # User A applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # User B tries to withdraw User A's application
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    res_withdraw = client.delete(f"/api/v1/applications/{app_id}")
    assert res_withdraw.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

def test_withdraw_application_forbidden_for_recruiter(client: TestClient, job_seeker_user, recruiter_user, open_job):
    # Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    assert res_create.status_code == status.HTTP_201_CREATED
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # Recruiter tries to withdraw it
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    res_withdraw = client.delete(f"/api/v1/applications/{app_id}")
    assert res_withdraw.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

def test_withdraw_application_not_found(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    res_withdraw = client.delete("/api/v1/applications/99999")
    assert res_withdraw.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_withdraw_already_withdrawn(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # 1. Apply
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    app_id = res_create.json()["id"]

    # 2. First withdrawal (success)
    client.delete(f"/api/v1/applications/{app_id}")

    # 3. Second withdrawal (already withdrawn)
    res_withdraw = client.delete(f"/api/v1/applications/{app_id}")
    assert res_withdraw.status_code == status.HTTP_400_BAD_REQUEST
    assert "already withdrawn" in res_withdraw.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

async def test_withdraw_selected_application_prevented(client: TestClient, db_session: AsyncSession, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # 1. Apply
    res_create = client.post("/api/v1/applications", json={"job_id": open_job.id})
    app_id = res_create.json()["id"]
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Modify status to SELECTED in database
    from app.repositories.applications import ApplicationRepository
    repo = ApplicationRepository()
    app_record = await repo.get_application_by_id(db_session, app_id)
    app_record.status = "SELECTED"
    db_session.add(app_record)
    await db_session.commit()

    # 3. Try to withdraw it
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res_withdraw = client.delete(f"/api/v1/applications/{app_id}")
    assert res_withdraw.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cannot withdraw application in status: SELECTED" in res_withdraw.json()["error"]["message"]

    app.dependency_overrides.pop(get_current_active_user, None)

async def test_recruiter_view_applications_success(client: TestClient, db_session: AsyncSession, job_seeker_user, recruiter_user, test_company, open_job):
    # Link recruiter to company
    recruiter_user.company_id = test_company.id
    db_session.add(recruiter_user)
    await db_session.commit()

    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    client.post("/api/v1/applications", json={"job_id": open_job.id})
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Recruiter fetches applications
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    response = client.get(f"/api/v1/recruiter/jobs/{open_job.id}/applications?page=1&limit=10")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["limit"] == 10
    assert len(data["items"]) == 1
    assert data["items"][0]["candidate"]["full_name"] == job_seeker_user.name
    assert data["items"][0]["resume"]["resume_file_name"] == "resume.pdf"
    assert data["items"][0]["job"]["job_title"] == open_job.title
    app.dependency_overrides.pop(get_current_active_user, None)

async def test_company_owner_view_applications_success(client: TestClient, db_session: AsyncSession, job_seeker_user, company_owner_user, test_company, open_job):
    # Set owner of company
    test_company.owner_id = company_owner_user.id
    db_session.add(test_company)
    await db_session.commit()

    # 1. Candidate applies
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    client.post("/api/v1/applications", json={"job_id": open_job.id})
    app.dependency_overrides.pop(get_current_active_user, None)

    # 2. Company Owner fetches applications
    app.dependency_overrides[get_current_active_user] = lambda: company_owner_user
    response = client.get(f"/api/v1/recruiter/jobs/{open_job.id}/applications?page=1&limit=10")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total"] == 1
    app.dependency_overrides.pop(get_current_active_user, None)

def test_view_applications_forbidden_for_job_seeker(client: TestClient, job_seeker_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    response = client.get(f"/api/v1/recruiter/jobs/{open_job.id}/applications")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

def test_view_applications_forbidden_for_other_company_recruiter(client: TestClient, recruiter_user, open_job):
    # recruiter_user does not belong to the company that posted open_job
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    response = client.get(f"/api/v1/recruiter/jobs/{open_job.id}/applications")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    app.dependency_overrides.pop(get_current_active_user, None)

def test_view_applications_not_found(client: TestClient, recruiter_user):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    response = client.get("/api/v1/recruiter/jobs/99999/applications")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    app.dependency_overrides.pop(get_current_active_user, None)

def test_view_applications_invalid_pagination(client: TestClient, recruiter_user, open_job):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user
    response = client.get(f"/api/v1/recruiter/jobs/{open_job.id}/applications?page=0")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    app.dependency_overrides.pop(get_current_active_user, None)

async def test_application_status_transitions(db_session: AsyncSession, job_seeker_user, recruiter_user, test_company, open_job):
    from app.services.applications import ApplicationService
    from app.models.applications import ApplicationStatus
    from app.schemas.applications import ApplicationCreate
    from fastapi import HTTPException

    # Setup recruiter
    recruiter_user.company_id = test_company.id
    db_session.add(recruiter_user)
    await db_session.commit()

    service = ApplicationService(db_session)

    # 1. Apply to job
    app_record = await service.apply_to_job(
        obj_in=ApplicationCreate(job_id=open_job.id),
        current_user=job_seeker_user
    )
    assert app_record.status == ApplicationStatus.APPLIED

    # 2. Valid transition: APPLIED -> SCREENING (by recruiter)
    updated_1 = await service.update_application_status(
        application_id=app_record.id,
        new_status=ApplicationStatus.SCREENING,
        current_user=recruiter_user
    )
    assert updated_1.status == ApplicationStatus.SCREENING

    # 3. Invalid transition: SCREENING -> SELECTED (must go through INTERVIEW first)
    with pytest.raises(HTTPException) as exc_info:
        await service.update_application_status(
            application_id=app_record.id,
            new_status=ApplicationStatus.SELECTED,
            current_user=recruiter_user
        )
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST

    # 4. Valid transition: SCREENING -> INTERVIEW
    updated_2 = await service.update_application_status(
        application_id=app_record.id,
        new_status=ApplicationStatus.INTERVIEW,
        current_user=recruiter_user
    )
    assert updated_2.status == ApplicationStatus.INTERVIEW

    # 5. Invalid transition: INTERVIEW -> APPLIED (cannot go backwards)
    with pytest.raises(HTTPException) as exc_info:
        await service.update_application_status(
            application_id=app_record.id,
            new_status=ApplicationStatus.APPLIED,
            current_user=recruiter_user
        )
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST

    # 6. Seeker forbidden from transitioning INTERVIEW -> SELECTED
    with pytest.raises(HTTPException) as exc_info:
        await service.update_application_status(
            application_id=app_record.id,
            new_status=ApplicationStatus.SELECTED,
            current_user=job_seeker_user
        )
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN

    # 7. Non-existent application status update
    with pytest.raises(HTTPException) as exc_info:
        await service.update_application_status(
            application_id=99999,
            new_status=ApplicationStatus.SCREENING,
            current_user=recruiter_user
        )
    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
