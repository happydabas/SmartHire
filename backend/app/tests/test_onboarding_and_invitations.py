import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import UserRole, UserStatus
from app.models.company_invitations import InvitationStatus

def test_recruiter_registration_and_company_onboarding(client: TestClient):
    # 1. Register Recruiter
    reg_payload = {
        "name": "Alex Recruiter",
        "email": "alex.recruiter@example.com",
        "password": "Password123!",
        "role": "recruiter"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    user_data = res.json()
    assert user_data["email"] == "alex.recruiter@example.com"
    assert user_data["role"] == "recruiter"
    assert user_data["company_id"] is None
    assert user_data["is_owner"] is False

    # 2. Login Recruiter
    login_res = client.post("/api/v1/auth/login", json={
        "email": "alex.recruiter@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    tokens = login_res.json()
    token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Company (Onboarding)
    comp_payload = {
        "name": "Apex Tech Solutions",
        "description": "Leading cloud software solutions firm",
        "industry": "Technology",
        "website": "https://www.apextech.com",
        "company_size": "11-50",
        "location": "San Francisco, CA"
    }
    comp_res = client.post("/api/v1/companies", json=comp_payload, headers=headers)
    assert comp_res.status_code == 201
    company = comp_res.json()
    assert company["name"] == "Apex Tech Solutions"
    company_id = company["id"]

    # 4. Check /auth/me to verify user updated as Company Owner
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["company_id"] == company_id
    assert me_data["is_owner"] is True


def test_company_invitation_flow_and_acceptance(client: TestClient):
    # 1. Register and setup Company Owner
    client.post("/api/v1/auth/register", json={
        "name": "Owner User",
        "email": "owner@company.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "owner@company.com",
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    comp = client.post("/api/v1/companies", json={
        "name": "Innovate Corp",
        "description": "Innovation software studio",
        "industry": "Technology",
        "company_size": "51-200",
        "location": "New York, NY"
    }, headers=headers).json()
    company_id = comp["id"]

    # 2. Owner sends invitation
    inv_email = "new.recruiter@company.com"
    inv_res = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": inv_email
    }, headers=headers)
    assert inv_res.status_code == 201
    inv_data = inv_res.json()
    assert inv_data["recruiter_email"] == inv_email
    assert inv_data["status"] == "pending"
    inv_token = inv_data["invitation_token"]

    # 3. Duplicate invitation attempt should fail
    dup_res = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": inv_email
    }, headers=headers)
    assert dup_res.status_code == 400

    # 4. Public token inspection
    detail_res = client.get(f"/api/v1/invitations/{inv_token}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["company_name"] == "Innovate Corp"
    assert detail["existing_user"] is False

    # 5. Accept invitation for new user
    accept_res = client.post("/api/v1/invitations/accept", json={
        "token": inv_token,
        "name": "New Recruiter Member",
        "password": "Password123!"
    })
    assert accept_res.status_code == 200
    accept_data = accept_res.json()
    assert "access_token" in accept_data
    new_user = accept_data["user"]
    assert new_user["email"] == inv_email
    assert new_user["company_id"] == company_id
    assert new_user["role"] == "recruiter"
    assert new_user["is_owner"] is False


def test_cancel_invitation_flow(client: TestClient):
    # Setup owner & company
    client.post("/api/v1/auth/register", json={
        "name": "Boss Owner",
        "email": "boss@corp.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    token = client.post("/api/v1/auth/login", json={
        "email": "boss@corp.com",
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    comp = client.post("/api/v1/companies", json={
        "name": "Boss Labs",
        "description": "Lab research",
        "industry": "Healthcare",
        "company_size": "1-10",
        "location": "Boston, MA"
    }, headers=headers).json()
    company_id = comp["id"]

    inv = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": "cancel.me@corp.com"
    }, headers=headers).json()

    cancel_res = client.delete(f"/api/v1/companies/{company_id}/invitations/{inv['id']}", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Attempting to accept cancelled invitation fails
    accept_res = client.post("/api/v1/invitations/accept", json={
        "token": inv["invitation_token"],
        "name": "Cancelled User",
        "password": "Password123!"
    })
    assert accept_res.status_code == 400


def test_authorization_owner_vs_recruiter(client: TestClient):
    # Owner Setup
    client.post("/api/v1/auth/register", json={
        "name": "Company Owner User",
        "email": "owner.auth@corp.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    owner_token = client.post("/api/v1/auth/login", json={
        "email": "owner.auth@corp.com",
        "password": "Password123!"
    }).json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    comp = client.post("/api/v1/companies", json={
        "name": "Auth Enterprise",
        "description": "Enterprise auth software",
        "industry": "Technology",
        "company_size": "201-500",
        "location": "Austin, TX"
    }, headers=owner_headers).json()
    company_id = comp["id"]

    # Invite normal recruiter
    inv = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": "member.recruiter@corp.com"
    }, headers=owner_headers).json()

    # Accept invitation as member
    rec_login = client.post("/api/v1/invitations/accept", json={
        "token": inv["invitation_token"],
        "name": "Member Recruiter",
        "password": "Password123!"
    }).json()
    member_token = rec_login["access_token"]
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # 1. Member CANNOT create job
    job_payload = {
        "title": "Backend Developer",
        "description": "Develop Python FastAPI services and async SQL models.",
        "location": "Remote",
        "work_mode": "Remote",
        "employment_type": "Full-time",
        "experience_level": "Mid",
        "job_type": "Full-time",
        "required_skills": ["Python", "FastAPI"]
    }
    member_job_res = client.post("/api/v1/jobs", json=job_payload, headers=member_headers)
    assert member_job_res.status_code == 403

    # 2. Member CANNOT update company settings
    member_comp_res = client.put(f"/api/v1/companies/{company_id}", json={
        "description": "Unauthorized edit"
    }, headers=member_headers)
    assert member_comp_res.status_code == 403

    # 3. Owner CAN create job
    owner_job_res = client.post("/api/v1/jobs", json=job_payload, headers=owner_headers)
    assert owner_job_res.status_code == 201


def test_jobseeker_authentication_integrity(client: TestClient):
    # Verify Job Seeker register & login remains unaffected
    js_reg = client.post("/api/v1/auth/register", json={
        "name": "Candidate User",
        "email": "candidate@jobseeker.com",
        "password": "Password123!",
        "role": "jobseeker"
    })
    assert js_reg.status_code == 201
    js_user = js_reg.json()
    assert js_user["role"] == "jobseeker"

    js_login = client.post("/api/v1/auth/login", json={
        "email": "candidate@jobseeker.com",
        "password": "Password123!"
    })
    assert js_login.status_code == 200
    token = js_login.json()["access_token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "jobseeker"
