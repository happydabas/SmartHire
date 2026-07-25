from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SectionDetailSchema(BaseModel):
    score: int
    strengths: List[str]
    weaknesses: List[str]

class SkillGapSchema(BaseModel):
    strong_skills: List[str] = []
    weak_skills: List[str] = []
    missing_technical: List[str] = []
    missing_soft: List[str] = []
    category: str = "Needs Improvement" # Excellent, Good, Needs Improvement

class KeywordAnalysisSchema(BaseModel):
    important_keywords: List[str] = []
    missing_keywords: List[str] = []
    density: float = 0.0
    recommendations: List[str] = []

class SuggestionItemSchema(BaseModel):
    text: str
    importance: str # High, Medium, Low

class ResumeAnalysisSchema(BaseModel):
    overall_score: int
    ats_score: int
    ats_evaluation: Dict[str, Any]
    section_analysis: Dict[str, SectionDetailSchema]
    missing_sections: List[str] = []
    skill_gap: SkillGapSchema
    suggestions: List[SuggestionItemSchema] = []
    ai_summary: str
    keywords: KeywordAnalysisSchema
