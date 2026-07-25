from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.ai.services.ai_service import ai_service
from app.ai.schemas.ai_response import AIResponse
from app.ai.prompts import resume_parser, resume_analysis, match_score, recommendations

router = APIRouter()

class ParseRequest(BaseModel):
    content: str

class AnalyzeRequest(BaseModel):
    content: str

class MatchScoreRequest(BaseModel):
    job_requirements: str
    resume_details: str

class RecommendRequest(BaseModel):
    skills: List[str]
    preferences: str

class MatchSkillsRequest(BaseModel):
    skills: List[str]
    requirements: List[str]

@router.post("/parse-resume", response_model=AIResponse)
async def parse_resume(request: ParseRequest):
    prompt = resume_parser.PROMPT_TEMPLATE.format(content=request.content)
    return await ai_service.execute_prompt(prompt, resume_parser.SYSTEM_INSTRUCTION)

@router.post("/analyze-resume", response_model=AIResponse)
async def analyze_resume(request: AnalyzeRequest):
    prompt = resume_analysis.PROMPT_TEMPLATE.format(content=request.content)
    return await ai_service.execute_prompt(prompt, resume_analysis.SYSTEM_INSTRUCTION)

@router.post("/match-score", response_model=AIResponse)
async def calculate_match_score(request: MatchScoreRequest):
    prompt = match_score.PROMPT_TEMPLATE.format(
        job_requirements=request.job_requirements,
        resume_details=request.resume_details
    )
    return await ai_service.execute_prompt(prompt, match_score.SYSTEM_INSTRUCTION)

@router.post("/recommend-jobs", response_model=AIResponse)
async def recommend_jobs(request: RecommendRequest):
    prompt = recommendations.PROMPT_TEMPLATE.format(
        skills=", ".join(request.skills),
        preferences=request.preferences
    )
    return await ai_service.execute_prompt(prompt, recommendations.SYSTEM_INSTRUCTION)

@router.post("/match-skills", response_model=AIResponse)
async def match_skills(request: MatchSkillsRequest):
    prompt = f"Match candidate skills [{', '.join(request.skills)}] with job requirements [{', '.join(request.requirements)}]."
    system_instruction = "You are a skill matcher. Return matched and missing skills in JSON."
    return await ai_service.execute_prompt(prompt, system_instruction)
