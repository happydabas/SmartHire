import pytest
import uuid
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.main import app
from app.models.users import User, UserRole, UserStatus
from app.models.skills import Skill
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

@pytest.fixture
async def sample_skills(db_session: AsyncSession):
    skills_to_check = [
        {"name": "Python", "category": "Backend"},
        {"name": "React", "category": "Frontend"},
        {"name": "Database", "category": "Data"}
    ]
    skills = []
    for s_info in skills_to_check:
        stmt = select(Skill).where(Skill.skill_name == s_info["name"])
        res = await db_session.execute(stmt)
        existing = res.scalars().first()
        if not existing:
            existing = Skill(skill_name=s_info["name"], category=s_info["category"])
            db_session.add(existing)
            await db_session.commit()
            await db_session.refresh(existing)
        skills.append(existing)
    return skills

def test_add_skills_success(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    payload = {
        "skill_ids": [sample_skills[0].id, sample_skills[1].id]
    }
    response = client.post("/api/v1/profile/skills", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert len(data) == 2
    # Ensure they are the added skills
    added_names = [s["skill_name"] for s in data]
    assert "Python" in added_names
    assert "React" in added_names

    app.dependency_overrides.pop(get_current_active_user, None)

def test_add_skills_forbidden_for_non_job_seeker(client: TestClient, recruiter_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: recruiter_user

    payload = {
        "skill_ids": [sample_skills[0].id]
    }
    response = client.post("/api/v1/profile/skills", json=payload)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    app.dependency_overrides.pop(get_current_active_user, None)

def test_add_skills_not_found(client: TestClient, job_seeker_user):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Provide a non-existent skill ID
    payload = {
        "skill_ids": [9999]
    }
    response = client.post("/api/v1/profile/skills", json=payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_add_skills_duplicate_in_payload(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Provide duplicate IDs in the request body
    payload = {
        "skill_ids": [sample_skills[0].id, sample_skills[0].id]
    }
    response = client.post("/api/v1/profile/skills", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    app.dependency_overrides.pop(get_current_active_user, None)

def test_add_skills_already_associated(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # First add Python
    res1 = client.post("/api/v1/profile/skills", json={"skill_ids": [sample_skills[0].id]})
    assert res1.status_code == status.HTTP_201_CREATED

    # Try to add Python again
    res2 = client.post("/api/v1/profile/skills", json={"skill_ids": [sample_skills[0].id]})
    assert res2.status_code == status.HTTP_400_BAD_REQUEST

    app.dependency_overrides.pop(get_current_active_user, None)

def test_list_skills_alphabetically(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Add React, Database, and Python (unsorted)
    client.post("/api/v1/profile/skills", json={
        "skill_ids": [sample_skills[1].id, sample_skills[2].id, sample_skills[0].id]
    })

    # Get skills
    response = client.get("/api/v1/profile/skills")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 3
    # Check alphabetical sorting: Database (D), Python (P), React (R)
    assert data[0]["skill_name"] == "Database"
    assert data[1]["skill_name"] == "Python"
    assert data[2]["skill_name"] == "React"

    app.dependency_overrides.pop(get_current_active_user, None)

def test_remove_skill(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Add Python
    client.post("/api/v1/profile/skills", json={"skill_ids": [sample_skills[0].id]})

    # Remove Python
    response = client.delete(f"/api/v1/profile/skills/{sample_skills[0].id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Fetch skills and verify empty
    get_res = client.get("/api/v1/profile/skills")
    assert len(get_res.json()) == 0

    app.dependency_overrides.pop(get_current_active_user, None)

def test_remove_skill_not_associated(client: TestClient, job_seeker_user, sample_skills):
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user

    # Try to delete Python without associating first
    response = client.delete(f"/api/v1/profile/skills/{sample_skills[0].id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)

def test_skills_ownership_protection(client: TestClient, job_seeker_user, another_job_seeker_user, sample_skills):
    # User A adds Python
    app.dependency_overrides[get_current_active_user] = lambda: job_seeker_user
    client.post("/api/v1/profile/skills", json={"skill_ids": [sample_skills[0].id]})

    # User B tries to delete User A's Python skill mapping
    app.dependency_overrides[get_current_active_user] = lambda: another_job_seeker_user
    response = client.delete(f"/api/v1/profile/skills/{sample_skills[0].id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    app.dependency_overrides.pop(get_current_active_user, None)
