import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.main import app
from app.models.users import User, UserRole, UserStatus
from app.models.experience import Experience
from app.models.resumes import Resume
from app.auth.dependencies import get_current_active_user

import uuid

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
        name="Another Job Seeker User",
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

def test_create_experience_success(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2023-01-01",
        "currently_working": True,
        "description": "Developing awesome backend services."
    }
    response = client.post("/api/v1/profile/experience", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["company_name"] == "Tech Corp"
    assert data["job_title"] == "Software Engineer"
    assert data["currently_working"] is True
    assert data["end_date"] is None
    assert "id" in data
    assert "resume_id" in data

    app.dependency_overrides.pop(get_current_active_user, None)

def test_create_experience_forbidden_for_non_job_seeker(client: TestClient, recruiter_user):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user

    payload = {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2023-01-01",
        "currently_working": True,
        "description": "Developing awesome backend services."
    }
    response = client.post("/api/v1/profile/experience", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.pop(get_current_active_user, None)

def test_experience_date_validations(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # 1. Start date must be before end date
    payload_invalid_dates = {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2023-01-01",
        "end_date": "2022-01-01",
        "currently_working": False,
        "description": "Developing awesome backend services."
    }
    response = client.post("/api/v1/profile/experience", json=payload_invalid_dates)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 2. If currently working is true, end date must be null
    payload_current_with_end = {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2023-01-01",
        "end_date": "2024-01-01",
        "currently_working": True,
        "description": "Developing awesome backend services."
    }
    response = client.post("/api/v1/profile/experience", json=payload_current_with_end)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 3. If currently working is false, end date must be specified
    payload_not_current_without_end = {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2023-01-01",
        "end_date": None,
        "currently_working": False,
        "description": "Developing awesome backend services."
    }
    response = client.post("/api/v1/profile/experience", json=payload_not_current_without_end)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    app.dependency_overrides.pop(get_current_active_user, None)

def test_list_experience_sorted_latest_first(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Add experience 1 (earlier)
    client.post("/api/v1/profile/experience", json={
        "company_name": "Company A",
        "job_title": "Developer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2020-01-01",
        "end_date": "2021-01-01",
        "currently_working": False,
        "description": "Responsibility A"
    })

    # Add experience 2 (latest)
    client.post("/api/v1/profile/experience", json={
        "company_name": "Company B",
        "job_title": "Senior Developer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2022-01-01",
        "currently_working": True,
        "description": "Responsibility B"
    })

    response = client.get("/api/v1/profile/experience")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    # Company B (start_date 2022-01-01) should be first, Company A (start_date 2020-01-01) second
    assert data[0]["company_name"] == "Company B"
    assert data[1]["company_name"] == "Company A"

    app.dependency_overrides.pop(get_current_active_user, None)

def test_update_experience(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Create record
    res = client.post("/api/v1/profile/experience", json={
        "company_name": "Company A",
        "job_title": "Developer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2020-01-01",
        "end_date": "2021-01-01",
        "currently_working": False,
        "description": "Responsibility A"
    })
    exp_id = res.json()["id"]

    # Update record
    update_payload = {
        "company_name": "Company A Updated",
        "job_title": "Lead Developer",
        "employment_type": "Contract",
        "location": "London",
        "start_date": "2020-01-01",
        "end_date": "2022-01-01",
        "currently_working": False,
        "description": "Responsibility A Updated"
    }
    response = client.put(f"/api/v1/profile/experience/{exp_id}", json=update_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["company_name"] == "Company A Updated"
    assert data["job_title"] == "Lead Developer"
    assert data["employment_type"] == "Contract"
    assert data["location"] == "London"

    app.dependency_overrides.pop(get_current_active_user, None)

def test_delete_experience(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Create record
    res = client.post("/api/v1/profile/experience", json={
        "company_name": "Company A",
        "job_title": "Developer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2020-01-01",
        "end_date": "2021-01-01",
        "currently_working": False,
        "description": "Responsibility A"
    })
    exp_id = res.json()["id"]

    # Delete record
    response = client.delete(f"/api/v1/profile/experience/{exp_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Get should return empty list (or no longer have it)
    get_res = client.get("/api/v1/profile/experience")
    assert not any(x["id"] == exp_id for x in get_res.json())

    app.dependency_overrides.pop(get_current_active_user, None)

def test_experience_ownership_protection(client: TestClient, job_seeker_user, another_job_seeker_user):
    # User A creates experience
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    res = client.post("/api/v1/profile/experience", json={
        "company_name": "Company A",
        "job_title": "Developer",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2020-01-01",
        "end_date": "2021-01-01",
        "currently_working": False,
        "description": "Responsibility A"
    })
    exp_id = res.json()["id"]

    # User B tries to update User A's experience record
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    update_payload = {
        "company_name": "Company A Hack",
        "job_title": "Hacker",
        "employment_type": "Full-time",
        "location": "Remote",
        "start_date": "2020-01-01",
        "end_date": "2021-01-01",
        "currently_working": False,
        "description": "Hack details"
    }
    response = client.put(f"/api/v1/profile/experience/{exp_id}", json=update_payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # User B tries to delete User A's experience record
    response = client.delete(f"/api/v1/profile/experience/{exp_id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.pop(get_current_active_user, None)
