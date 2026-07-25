import httpx
from typing import Dict, Any, Optional
from app.ai.providers.base_provider import BaseProvider
from app.core.config import settings

class GeminiProvider(BaseProvider):
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL if settings.AI_MODEL != "mock-model" else "gemini-1.5-pro"
        self.temperature = settings.AI_TEMPERATURE
        self.max_tokens = settings.AI_MAX_TOKENS
        self.timeout = settings.AI_TIMEOUT

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        if not self.api_key or self.api_key == "mock-key":
            raise ValueError("Invalid Gemini API Key")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"System Instruction: {system_instruction}\n\nUser Prompt: {prompt}"}]
            })
        else:
            contents.append({
                "role": "user",
                "parts": [{"text": prompt}]
            })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_tokens
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code == 400:
                raise ValueError("Gemini invalid request parameters")
            if response.status_code == 401 or response.status_code == 403:
                raise PermissionError("Gemini authentication failure: Invalid API Key")
            if response.status_code == 429:
                raise ConnectionError("Gemini rate limit exceeded")
            if response.status_code >= 500:
                raise ConnectionError("Gemini temporary provider error")
                
            response.raise_for_status()
            result = response.json()
            
            try:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                raise ValueError("Invalid Gemini model response format") from e
                
            return {
                "text": text,
                "model": self.model
            }
