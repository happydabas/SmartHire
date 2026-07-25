import httpx
from typing import Dict, Any, Optional
from app.ai.providers.base_provider import BaseProvider
from app.core.config import settings

class OllamaProvider(BaseProvider):
    def __init__(self):
        self.endpoint = "http://localhost:11434/api/generate"
        self.model = settings.AI_MODEL if settings.AI_MODEL != "mock-model" else "llama3"
        self.temperature = settings.AI_TEMPERATURE
        self.timeout = settings.AI_TIMEOUT

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_instruction or "",
            "stream": False,
            "options": {
                "temperature": self.temperature
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(self.endpoint, json=payload)
                response.raise_for_status()
                result = response.json()
                return {
                    "text": result.get("response", ""),
                    "model": self.model
                }
            except httpx.ConnectError as e:
                raise ConnectionError("Local Ollama service unavailable. Make sure Ollama is running.") from e
