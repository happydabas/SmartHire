from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PersonalInfoSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_website: Optional[str] = None

class EducationSchema(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None

class ExperienceSchema(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current_job: Optional[bool] = False
    responsibilities: Optional[str] = None

class ProjectSchema(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    technologies_used: List[str] = []
    github_link: Optional[str] = None
    live_demo_link: Optional[str] = None

class CertificationSchema(BaseModel):
    certification_name: Optional[str] = None
    organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_url: Optional[str] = None

class ConfidenceScoresSchema(BaseModel):
    personal_info: int = 90
    skills: int = 90
    experience: int = 90
    overall_parsing: int = 90

class ParsedResumeSchema(BaseModel):
    personal_info: PersonalInfoSchema
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[EducationSchema] = []
    experience: List[ExperienceSchema] = []
    projects: List[ProjectSchema] = []
    certifications: List[CertificationSchema] = []
    confidence_scores: ConfidenceScoresSchema
