import pytest
from fastapi.testclient import TestClient

def test_job_recruiter_assignments_and_authorization_scenario(client: TestClient):
    """
    Test scenario:
    Company: SmartHire
    Owner: Harsh
    Recruiters: Rahul, Priya
    Jobs: Job A, Job B, Job C
    Assignments:
      Job A -> Rahul
      Job B -> Priya
      Job C -> Rahul + Priya
    """
    # 1. Register Owner Harsh
    client.post("/api/v1/auth/register", json={
        "name": "Harsh Owner",
        "email": "harsh.owner@smarthire.com",
        "password": "Password123!",
        "role": "recruiter"
    })
    harsh_login = client.post("/api/v1/auth/login", json={
        "email": "harsh.owner@smarthire.com",
        "password": "Password123!"
    }).json()
    harsh_token = harsh_login["access_token"]
    harsh_headers = {"Authorization": f"Bearer {harsh_token}"}
    harsh_id = harsh_login["user"]["id"]

    # 2. Harsh creates Company "SmartHire"
    company_res = client.post("/api/v1/companies", json={
        "name": "SmartHire",
        "description": "Smart hiring software platform",
        "industry": "Technology",
        "company_size": "11-50",
        "location": "San Francisco, CA"
    }, headers=harsh_headers)
    assert company_res.status_code == 201
    company_id = company_res.json()["id"]

    # 3. Harsh invites Rahul and Priya
    inv_rahul = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": "rahul@smarthire.com"
    }, headers=harsh_headers).json()

    inv_priya = client.post(f"/api/v1/companies/{company_id}/invitations", json={
        "recruiter_email": "priya@smarthire.com"
    }, headers=harsh_headers).json()

    # 4. Rahul accepts invitation
    rahul_accept = client.post("/api/v1/invitations/accept", json={
        "token": inv_rahul["invitation_token"],
        "name": "Rahul Sharma",
        "password": "Password123!"
    }).json()
    rahul_token = rahul_accept["access_token"]
    rahul_headers = {"Authorization": f"Bearer {rahul_token}"}
    rahul_id = rahul_accept["user"]["id"]

    # 5. Priya accepts invitation
    priya_accept = client.post("/api/v1/invitations/accept", json={
        "token": inv_priya["invitation_token"],
        "name": "Priya Singh",
        "password": "Password123!"
    }).json()
    priya_token = priya_accept["access_token"]
    priya_headers = {"Authorization": f"Bearer {priya_token}"}
    priya_id = priya_accept["user"]["id"]

    # Base payload fields for jobs
    base_job_data = {
        "description": "Develop and maintain web services.",
        "location": "San Francisco, CA",
        "work_mode": "Remote",
        "employment_type": "Full-time",
        "experience_level": "Mid",
        "job_type": "Full-time",
        "status": "open",
        "required_skills": ["Python", "React"]
    }

    # 6. Harsh creates Job A assigned to Rahul
    job_a_res = client.post("/api/v1/jobs", json={
        **base_job_data,
        "title": "Job A - Backend Engineer",
        "recruiter_ids": [rahul_id]
    }, headers=harsh_headers)
    assert job_a_res.status_code == 201
    job_a_id = job_a_res.json()["id"]

    # 7. Harsh creates Job B assigned to Priya
    job_b_res = client.post("/api/v1/jobs", json={
        **base_job_data,
        "title": "Job B - Frontend Developer",
        "recruiter_ids": [priya_id]
    }, headers=harsh_headers)
    assert job_b_res.status_code == 201
    job_b_id = job_b_res.json()["id"]

    # 8. Harsh creates Job C assigned to Rahul + Priya
    job_c_res = client.post("/api/v1/jobs", json={
        **base_job_data,
        "title": "Job C - Fullstack Lead",
        "recruiter_ids": [rahul_id, priya_id]
    }, headers=harsh_headers)
    assert job_c_res.status_code == 201
    job_c_id = job_c_res.json()["id"]

    # 9. Register Job Seeker Candidate & create profile/resume
    client.post("/api/v1/auth/register", json={
        "name": "Candidate User",
        "email": "candidate@example.com",
        "password": "Password123!",
        "role": "jobseeker"
    })
    cand_token = client.post("/api/v1/auth/login", json={
        "email": "candidate@example.com",
        "password": "Password123!"
    }).json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    from app.tests.conftest import TestingSessionLocal
    import asyncio
    async def add_profile_and_resume():
        async with TestingSessionLocal() as session:
            from app.models.profiles import JobSeekerProfile
            from app.models.resumes import Resume
            from app.repositories.users import UserRepository
            u = await UserRepository().get_by_email(session, email="candidate@example.com")
            import datetime
            prof = JobSeekerProfile(
                user_id=u.id,
                full_name="Candidate User",
                phone_number="1234567890",
                date_of_birth=datetime.date(2000, 1, 1),
                gender="Other",
                address="123 St",
                city="San Francisco",
                state="CA",
                country="USA"
            )
            session.add(prof)
            res = Resume(user_id=u.id, file_name="resume.pdf", file_path="/uploads/resume.pdf", file_size=1024)
            session.add(res)
            await session.commit()
    asyncio.run(add_profile_and_resume())

    # Candidate applies to Job A, Job B, Job C
    app_a = client.post("/api/v1/applications", json={"job_id": job_a_id}, headers=cand_headers)
    assert app_a.status_code == 201

    app_b = client.post("/api/v1/applications", json={"job_id": job_b_id}, headers=cand_headers)
    assert app_b.status_code == 201

    app_c = client.post("/api/v1/applications", json={"job_id": job_c_id}, headers=cand_headers)
    assert app_c.status_code == 201

    # ==========================================
    # VERIFICATION 1: Harsh (Owner)
    # ==========================================
    harsh_jobs = client.get(f"/api/v1/companies/{company_id}/jobs", headers=harsh_headers).json()
    harsh_job_ids = [j["id"] for j in harsh_jobs]
    assert len(harsh_job_ids) == 3
    assert set(harsh_job_ids) == {job_a_id, job_b_id, job_c_id}

    harsh_apps = client.get("/api/v1/applications/company", headers=harsh_headers).json()
    assert harsh_apps["total"] == 3

    # ==========================================
    # VERIFICATION 2: Rahul (Recruiter)
    # ==========================================
    rahul_jobs = client.get(f"/api/v1/companies/{company_id}/jobs", headers=rahul_headers).json()
    rahul_job_ids = [j["id"] for j in rahul_jobs]
    assert len(rahul_job_ids) == 2
    assert set(rahul_job_ids) == {job_a_id, job_c_id}
    assert job_b_id not in rahul_job_ids

    # Rahul can access Job A and Job C details
    assert client.get(f"/api/v1/jobs/{job_a_id}", headers=rahul_headers).status_code == 200
    assert client.get(f"/api/v1/jobs/{job_c_id}", headers=rahul_headers).status_code == 200

    # Rahul CANNOT access Job B details (403 Forbidden)
    assert client.get(f"/api/v1/jobs/{job_b_id}", headers=rahul_headers).status_code == 403

    # Rahul sees applications for Job A and Job C only
    rahul_apps = client.get("/api/v1/applications/company", headers=rahul_headers).json()
    assert rahul_apps["total"] == 2
    rahul_app_job_ids = [a["job"]["id"] for a in rahul_apps["items"]]
    assert set(rahul_app_job_ids) == {job_a_id, job_c_id}
    assert job_b_id not in rahul_app_job_ids

    # Rahul CANNOT access applications for Job B directly (403 Forbidden)
    assert client.get(f"/api/v1/recruiter/jobs/{job_b_id}/applications", headers=rahul_headers).status_code == 403

    # Rahul CANNOT create a job (403 Forbidden)
    rahul_create_res = client.post("/api/v1/jobs", json={
        **base_job_data,
        "title": "Unauthorized Job"
    }, headers=rahul_headers)
    assert rahul_create_res.status_code == 403

    # Rahul CANNOT modify company profile settings (403 Forbidden)
    rahul_comp_update = client.put(f"/api/v1/companies/{company_id}", json={
        "description": "Hacked company description"
    }, headers=rahul_headers)
    assert rahul_comp_update.status_code == 403

    # ==========================================
    # VERIFICATION 3: Priya (Recruiter)
    # ==========================================
    priya_jobs = client.get(f"/api/v1/companies/{company_id}/jobs", headers=priya_headers).json()
    priya_job_ids = [j["id"] for j in priya_jobs]
    assert len(priya_job_ids) == 2
    assert set(priya_job_ids) == {job_b_id, job_c_id}
    assert job_a_id not in priya_job_ids

    # Priya can access Job B and Job C details
    assert client.get(f"/api/v1/jobs/{job_b_id}", headers=priya_headers).status_code == 200
    assert client.get(f"/api/v1/jobs/{job_c_id}", headers=priya_headers).status_code == 200

    # Priya CANNOT access Job A details (403 Forbidden)
    assert client.get(f"/api/v1/jobs/{job_a_id}", headers=priya_headers).status_code == 403

    # Priya sees applications for Job B and Job C only
    priya_apps = client.get("/api/v1/applications/company", headers=priya_headers).json()
    assert priya_apps["total"] == 2
    priya_app_job_ids = [a["job"]["id"] for a in priya_apps["items"]]
    assert set(priya_app_job_ids) == {job_b_id, job_c_id}
    assert job_a_id not in priya_app_job_ids
