from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, test_rbac, companies, jobs, my, profiles, saved_jobs, applications, recruiter

api_router = APIRouter()

# Mount health diagnostics endpoint under /health
api_router.include_router(health.router, prefix="/health")

# Mount authentication endpoint routes under /auth
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Mount RBAC testing endpoint routes under /test
api_router.include_router(test_rbac.router, prefix="/test", tags=["RBAC Test"])

# Mount companies endpoint routes under /companies
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])

# Mount jobs endpoint routes under /jobs
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# Mount recruiter/owner profile endpoint routes under /my
api_router.include_router(my.router, prefix="/my", tags=["My"])

# Mount job seeker profile endpoint routes under /profile
api_router.include_router(profiles.router, prefix="/profile", tags=["Profile"])

# Mount saved jobs endpoint routes under /saved-jobs
api_router.include_router(saved_jobs.router, prefix="/saved-jobs", tags=["Saved Jobs"])

# Mount job applications endpoint routes under /applications
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])

# Mount recruiter endpoint routes under /recruiter
api_router.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
