from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SectionMatchDetailSchema(BaseModel):
    score: int
    explanation: str

class SkillsComparisonSchema(BaseModel):
    matched: List[str] = []
    missing: List[str] = []
    additional: List[str] = []

class ExperienceComparisonSchema(BaseModel):
    required_years: float = 0.0
    candidate_years: float = 0.0
    relevant_roles_match: bool = True
    explanation: str

class EducationComparisonSchema(BaseModel):
    degree_match: bool = True
    explanation: str

class ProjectComparisonSchema(BaseModel):
    relevant_projects: List[str] = []
    missing_experience: List[str] = []

class CertificationComparisonSchema(BaseModel):
    matched: List[str] = []
    missing: List[str] = []
    optional: List[str] = []
    explanation: str

class ImprovementSuggestionItemSchema(BaseModel):
    text: str
    priority: str # High, Medium, Low

class AIMatchScoreResponseSchema(BaseModel):
    overall_score: int
    breakdown: Dict[str, SectionMatchDetailSchema]
    skills_comparison: SkillsComparisonSchema
    experience_comparison: ExperienceComparisonSchema
    education_comparison: EducationComparisonSchema
    project_comparison: ProjectComparisonSchema
    certification_comparison: CertificationComparisonSchema
    ai_explanation: str
    suggestions: List[ImprovementSuggestionItemSchema] = []
    strengths: List[str] = []
    weaknesses: List[str] = []

