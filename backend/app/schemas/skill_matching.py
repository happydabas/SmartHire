from pydantic import BaseModel
from typing import List, Dict, Optional

class RelatedSkillItemSchema(BaseModel):
    required: str
    candidate: str
    confidence: float

class MissingSkillItemSchema(BaseModel):
    name: str
    importance: str # High, Medium, Low

class SkillGapItemSchema(BaseModel):
    gap_name: str
    priority: str # High, Medium, Low

class LearningRecommendationItemSchema(BaseModel):
    recommendation: str
    priority: str # High, Medium, Low

class AISkillMatchingResponseSchema(BaseModel):
    overall_coverage: int
    matched_skills: List[str] = []
    related_skills: List[RelatedSkillItemSchema] = []
    missing_skills: List[MissingSkillItemSchema] = []
    additional_skills: List[str] = []
    category_coverage: Dict[str, int] = {}
    skill_gap_analysis: List[SkillGapItemSchema] = []
    learning_recommendations: List[LearningRecommendationItemSchema] = []
