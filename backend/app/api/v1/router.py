from fastapi import APIRouter
from app.api.v1.endpoints import health

api_router = APIRouter()

# Mount health diagnostics endpoint under /health
api_router.include_router(health.router, prefix="/health")

# Feature routes (e.g. jobs, users) can be added below:
# from app.api.v1.endpoints import auth, jobs, resumes
# api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
# api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
