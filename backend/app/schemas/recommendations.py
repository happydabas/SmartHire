from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobRecommendationResponseSchema(BaseModel):
    job_id: int
    title: str
    company_name: str
    location: str
    salary: str
    match_score: int
    reason: str
    confidence_score: float

class AIRecommendationsOutputSchema(BaseModel):
    summary: str
    recommendations: List[JobRecommendationResponseSchema] = []

class CandidateRecommendationItemSchema(BaseModel):
    candidate_id: int
    name: str
    email: str
    match_score: int
    reason: str

class RecruiterRecommendationsPlaceholderSchema(BaseModel):
    job_id: int
    recommended_candidates: List[CandidateRecommendationItemSchema] = []
    message: str = "Recruiter candidate recommendations placeholder response."

class RecommendationHistoryItemSchema(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    match_score: int
    reason: str
    created_at: str
