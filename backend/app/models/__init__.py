# Export all models for easier imports and to ensure Alembic discovers them
from app.models.base import Base
from app.models.users import User, UserRole
from app.models.companies import Company
from app.models.profiles import JobSeekerProfile
from app.models.jobs import Job, JobType, ExperienceLevel
from app.models.skills import Skill
from app.models.job_required_skills import JobRequiredSkill
from app.models.resumes import Resume
from app.models.resume_skills import ResumeSkill
from app.models.education import Education
from app.models.experience import Experience
from app.models.projects import Project
from app.models.certifications import Certification
from app.models.pipelines import HiringPipeline, PipelineStage
from app.models.applications import Application
from app.models.application_status_history import ApplicationStatusHistory
from app.models.recruiter_notes import RecruiterNote
from app.models.notifications import Notification
from app.models.company_invitations import CompanyInvitation, InvitationStatus
from app.models.saved_jobs import SavedJob
from app.models.job_recruiters import JobRecruiter

__all__ = [
    "Base",
    "User",
    "UserRole",
    "Company",
    "JobSeekerProfile",
    "Job",
    "JobType",
    "ExperienceLevel",
    "Skill",
    "JobRequiredSkill",
    "Resume",
    "ResumeSkill",
    "Education",
    "Experience",
    "Project",
    "Certification",
    "HiringPipeline",
    "PipelineStage",
    "Application",
    "ApplicationStatusHistory",
    "RecruiterNote",
    "Notification",
    "CompanyInvitation",
    "InvitationStatus",
    "SavedJob",
    "JobRecruiter",
]
