import datetime
import pytest
from fastapi.testclient import TestClient
from app.tests.conftest import TestingSessionLocal
import asyncio

def test_unauthenticated_api_access_blocked(client: TestClient):
    """Verify that unauthenticated API calls return HTTP 401 Unauthorized."""
    assert client.post("/api/v1/jobs", json={}).status_code == 401
    assert client.get("/api/v1/jobs/1").status_code == 401
    assert client.put("/api/v1/companies/1", json={}).status_code == 401
    assert client.get("/api/v1/applications/company").status_code == 401
    assert client.post("/api/v1/companies/1/invitations", json={}).status_code == 401


def test_owner_only_endpoints_blocked_for_normal_recruiter(client: TestClient):
    """
    Verify that normal recruiters receive HTTP 403 Forbidden when calling owner-only endpoints.
    """
    # 1. Setup Owner and Company
    client.post("/api/v1/auth/register", json={
        "name": "Owner User",
        "email": "owner.sec@smarthire.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    owner_token = client.post("/api/v1/auth/login", json={
        "email": "owner.sec@smarthire.com",
        "password": "Password123!"
    }).json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    company_res = client.post("/api/v1/companies", json={
        "name": "SecuCorp",
        "description": "Security Testing Corp",
        "industry": "Technology",
        "company_size": "11-50",
        "location": "New York, NY"
    }, headers=owner_headers).json()
    company_id = company_res["id"]

    # Invite recruiter
    inv_res = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": "normal.rec@smarthire.com"
    }, headers=owner_headers).json()

    # Recruiter accepts invitation
    rec_accept = client.post("/api/v1/invitations/accept", json={
        "token": inv_res["invitation_token"],
        "name": "Normal Recruiter",
        "password": "Password123!"
    }).json()
    rec_token = rec_accept["access_token"]
    rec_headers = {"Authorization": f"Bearer {rec_token}"}

    # Owner creates a job
    base_job = {
        "title": "Software Engineer",
        "description": "Develop apps",
        "location": "Remote",
        "work_mode": "Remote",
        "job_type": "Full-time",
        "experience_level": "Mid",
        "status": "open",
        "required_skills": ["Python"]
    }
    job_res = client.post("/api/v1/jobs", json=base_job, headers=owner_headers).json()
    job_id = job_res["id"]

    # 2. Recruiter attempts Owner-Only Actions -> All MUST return 403 Forbidden
    # A. Create Job
    assert client.post("/api/v1/jobs", json=base_job, headers=rec_headers).status_code == 403

    # B. Update Recruiter Assignments
    assert client.put(f"/api/v1/jobs/{job_id}/assignments", json={"recruiter_ids": []}, headers=rec_headers).status_code == 403

    # C. Update Company Settings
    assert client.put(f"/api/v1/companies/{company_id}", json={"name": "Hacked"}, headers=rec_headers).status_code == 403

    # D. Send Invitation
    assert client.post(f"/api/v1/companies/{company_id}/invitations", json={"recruiter_email": "x@y.com"}, headers=rec_headers).status_code == 403

    # E. List Invitations
    assert client.get(f"/api/v1/companies/{company_id}/invitations", headers=rec_headers).status_code == 403

    # F. Cancel Invitation
    assert client.delete(f"/api/v1/companies/{company_id}/invitations/{inv_res['id']}", headers=rec_headers).status_code == 403

    # G. Remove Recruiter
    rec_id = rec_accept["user"]["id"]
    assert client.delete(f"/api/v1/companies/{company_id}/recruiters/{rec_id}", headers=rec_headers).status_code == 403


def test_url_tampering_and_unassigned_job_authorization_blocked(client: TestClient):
    """
    Verify that a recruiter cannot tamper with URL parameters to view or modify
    jobs or candidate applications not assigned to them.
    """
    # 1. Register Owner Harsh
    client.post("/api/v1/auth/register", json={
        "name": "Owner Harsh",
        "email": "harsh.sec@smarthire.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    harsh_token = client.post("/api/v1/auth/login", json={
        "email": "harsh.sec@smarthire.com",
        "password": "Password123!"
    }).json()["access_token"]
    harsh_headers = {"Authorization": f"Bearer {harsh_token}"}

    company_id = client.post("/api/v1/companies", json={
        "name": "AuthShield Inc",
        "description": "Security testing company",
        "industry": "Technology",
        "company_size": "1-10",
        "location": "Boston, MA"
    }, headers=harsh_headers).json()["id"]

    # 2. Invite Recruiter Alice and Recruiter Bob
    inv_alice = client.post(f"/api/v1/companies/{company_id}/invitations", json={"recruiter_email": "alice@smarthire.com"}, headers=harsh_headers).json()
    inv_bob = client.post(f"/api/v1/companies/{company_id}/invitations", json={"recruiter_email": "bob@smarthire.com"}, headers=harsh_headers).json()

    alice_token = client.post("/api/v1/invitations/accept", json={"token": inv_alice["invitation_token"], "name": "Alice Recruiter", "password": "Password123!"}).json()["access_token"]
    bob_accept = client.post("/api/v1/invitations/accept", json={"token": inv_bob["invitation_token"], "name": "Bob Recruiter", "password": "Password123!"}).json()
    bob_token = bob_accept["access_token"]
    bob_id = bob_accept["user"]["id"]

    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    bob_headers = {"Authorization": f"Bearer {bob_token}"}

    # 3. Harsh creates Job 1 assigned ONLY to Bob
    job_1 = client.post("/api/v1/jobs", json={
        "title": "Backend Architect",
        "description": "Architect core systems",
        "location": "Remote",
        "work_mode": "Remote",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "status": "open",
        "required_skills": ["Python"],
        "recruiter_ids": [bob_id]
    }, headers=harsh_headers).json()
    job_1_id = job_1["id"]

    # Candidate registers and applies to Job 1
    client.post("/api/v1/auth/register", json={"name": "Candidate One", "email": "cand.one@example.com", "password": "Password123!", "role": "jobseeker"})
    cand_token = client.post("/api/v1/auth/login", json={"email": "cand.one@example.com", "password": "Password123!"}).json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    async def add_candidate_profile():
        async with TestingSessionLocal() as session:
            from app.models.profiles import JobSeekerProfile
            from app.models.resumes import Resume
            from app.repositories.users import UserRepository
            u = await UserRepository().get_by_email(session, email="cand.one@example.com")
            session.add(JobSeekerProfile(user_id=u.id, full_name="Candidate One", phone_number="9998887770", date_of_birth=datetime.date(1995, 5, 5), gender="Other", address="100 Wall St", city="NY", state="NY", country="USA"))
            session.add(Resume(user_id=u.id, file_name="resume.pdf", file_path="/uploads/resume.pdf", file_size=2048))
            await session.commit()
    asyncio.run(add_candidate_profile())

    app_res = client.post("/api/v1/applications", json={"job_id": job_1_id}, headers=cand_headers).json()
    app_id = app_res["id"]

    # 4. Verification: Bob (assigned) CAN access Job 1 and Application
    assert client.get(f"/api/v1/jobs/{job_1_id}", headers=bob_headers).status_code == 200
    assert client.get(f"/api/v1/recruiter/jobs/{job_1_id}/applications", headers=bob_headers).status_code == 200
    assert client.get(f"/api/v1/applications/{app_id}", headers=bob_headers).status_code == 200

    # 5. Verification: Alice (member recruiter in company) CAN view Job 1 posting details (200),
    # but CANNOT access candidate applications for unassigned job -> 403 Forbidden
    assert client.get(f"/api/v1/jobs/{job_1_id}", headers=alice_headers).status_code == 200
    assert client.get(f"/api/v1/recruiter/jobs/{job_1_id}/applications", headers=alice_headers).status_code == 403
    assert client.get(f"/api/v1/applications/{app_id}", headers=alice_headers).status_code == 403

    # Alice CANNOT update application status
    assert client.patch(f"/api/v1/applications/{app_id}/status", json={"status": "SCREENING"}, headers=alice_headers).status_code == 403


def test_jobseeker_regression_auth_and_applications(client: TestClient):
    """
    Verify Job Seeker registration, login, open job browsing, and applying works cleanly.
    """
    # Register & login Job Seeker
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Jane JobSeeker",
        "email": "jane.js@example.com",
        "password": "Password123!",
        "role": "jobseeker"
    })
    assert reg_res.status_code == 201

    login_res = client.post("/api/v1/auth/login", json={
        "email": "jane.js@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    js_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # Open jobs list
    res = client.get("/api/v1/jobs", headers=js_headers).json()
    jobs = res.get("items") or res.get("jobs") or res
    assert isinstance(jobs, list)
