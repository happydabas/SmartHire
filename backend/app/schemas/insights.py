from pydantic import BaseModel
from typing import List, Dict, Optional

# Job Seeker Schema details
class ResumeTipItemSchema(BaseModel):
    tip: str
    priority: str # High, Medium, Low

class ResumeHealthSchema(BaseModel):
    resume_strength: int # 0 to 100
    ats_readiness: int # 0 to 100
    profile_completeness: int # 0 to 100
    improvement_tips: List[ResumeTipItemSchema] = []

class CareerSuggestionItemSchema(BaseModel):
    path: str
    reason: str

class LearningRecommendationItemSchema(BaseModel):
    skill: str
    category: str
    impact_level: str # High, Medium, Low

class JobSeekerInsightsResponseSchema(BaseModel):
    summary: str
    resume_health: ResumeHealthSchema
    career_suggestions: List[CareerSuggestionItemSchema] = []
    learning_roadmap: List[LearningRecommendationItemSchema] = []
    top_skills: List[str] = []
    weak_skills: List[str] = []

# Recruiter Schema details
class CandidateInsightItemSchema(BaseModel):
    name: str
    email: str
    match_score: int
    status: str

class SkillDemandItemSchema(BaseModel):
    skill_name: str
    demand_growth_percent: int
    trending_status: str # High, Medium, Stable

class HiringRecommendationItemSchema(BaseModel):
    suggestion: str
    reason: str
    impact: str # High, Medium, Low

class RecruiterInsightsResponseSchema(BaseModel):
    summary: str
    top_matching_candidates: List[CandidateInsightItemSchema] = []
    missing_skills: List[str] = []
    average_match_score: int = 80
    most_applied_jobs: List[str] = []
    few_applications_jobs: List[str] = []
    skill_demand: List[SkillDemandItemSchema] = []
    hiring_recommendations: List[HiringRecommendationItemSchema] = []

# History List Schema details
class InsightHistoryItemSchema(BaseModel):
    id: int
    insight_type: str
    summary: str
    created_at: str
