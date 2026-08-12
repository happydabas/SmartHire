from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, test_rbac, companies, invitations, jobs, my, profiles, saved_jobs, applications, recruiter, ai
from app.api import resume_parser
from app.api import resume_analysis
from app.api import match_score
from app.api import skill_matching
from app.api import recommendations
from app.api import insights

api_router = APIRouter()

# Mount health diagnostics endpoint under /health
api_router.include_router(health.router, prefix="/health")

# Mount authentication endpoint routes under /auth
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Mount invitations endpoint routes under /invitations
api_router.include_router(invitations.router, prefix="/invitations", tags=["Invitations"])

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

# Mount AI Foundation routes under /ai
api_router.include_router(ai.router, prefix="/ai", tags=["AI Foundation"])

# Mount Resume Parser routes under /resume-parser
api_router.include_router(resume_parser.router, prefix="/resume-parser", tags=["Resume Parser"])

# Mount Resume Analysis routes under /resume-analysis
api_router.include_router(resume_analysis.router, prefix="/resume-analysis", tags=["Resume Analysis"])

# Mount Match Score routes under /match-score
api_router.include_router(match_score.router, prefix="/match-score", tags=["AI Match Score"])

# Mount Skill Matching routes under /skill-matching
api_router.include_router(skill_matching.router, prefix="/skill-matching", tags=["AI Skill Matching"])

# Mount Recommendations routes under /recommendations
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["AI Recommendations"])

# Mount AI Insights routes under /insights
api_router.include_router(insights.router, prefix="/insights", tags=["AI Insights"])
