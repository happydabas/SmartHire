import asyncio
from typing import Dict, Any, Optional
from app.ai.providers.base_provider import BaseProvider

class MockProvider(BaseProvider):
    def __init__(self):
        self.model = "mock-model-v1"

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        await asyncio.sleep(0.5)
        
        prompt_lower = prompt.lower()
        if "parse" in prompt_lower or "parser" in prompt_lower:
            mock_data = (
                "{\n"
                '  "name": "Jane Doe",\n'
                '  "email": "jane.doe@example.com",\n'
                '  "skills": ["Python", "FastAPI", "React", "TypeScript"],\n'
                '  "experience_years": 4\n'
                "}"
            )
        elif "analyze" in prompt_lower or "analysis" in prompt_lower:
            mock_data = (
                "{\n"
                '  "strengths": ["Strong FastAPI backend skills", "React frontend competence"],\n'
                '  "weaknesses": ["Lacks cloud deployment certifications"],\n'
                '  "summary": "Highly qualified frontend/backend engineer with matching core tech stack."\n'
                "}"
            )
        elif "score" in prompt_lower or "matching" in prompt_lower:
            mock_data = (
                "{\n"
                '  "score": 85,\n'
                '  "reason": "Candidate has direct experience in 4 of the 5 requested skills."\n'
                "}"
            )
        else:
            mock_data = "Mock response data for prompt: " + prompt[:50] + "..."

        return {
            "text": mock_data,
            "model": self.model
        }
