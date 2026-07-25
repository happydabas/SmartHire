import httpx
from typing import Dict, Any, Optional
from app.ai.providers.base_provider import BaseProvider
from app.core.config import settings

class OpenAIProvider(BaseProvider):
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL if settings.AI_MODEL != "mock-model" else "gpt-4-turbo"
        self.temperature = settings.AI_TEMPERATURE
        self.max_tokens = settings.AI_MAX_TOKENS
        self.timeout = settings.AI_TIMEOUT

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        if not self.api_key or self.api_key == "mock-key":
            raise ValueError("Invalid OpenAI API Key")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 401:
                raise PermissionError("OpenAI authentication failure: Invalid API Key")
            if response.status_code == 429:
                raise ConnectionError("OpenAI rate limit exceeded")
            if response.status_code >= 500:
                raise ConnectionError("OpenAI temporary provider error")
            
            response.raise_for_status()
            result = response.json()
            return {
                "text": result["choices"][0]["message"]["content"],
                "model": result.get("model", self.model)
            }
