import time
import logging
from typing import Dict, Any, Optional
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.ollama_provider import OllamaProvider
from app.ai.providers.mock_provider import MockProvider
from app.ai.schemas.ai_response import AIResponse
from app.ai.utils.retry import retry_async
from app.ai.utils.rate_limiter import ai_rate_limiter
from app.core.config import settings

logger = logging.getLogger("app.ai.service")

class AIService:
    def __init__(self):
        self.provider_name = settings.AI_PROVIDER.lower()
        self._provider = None

    def _get_provider(self):
        if self._provider is not None:
            return self._provider

        if self.provider_name == "openai":
            self._provider = OpenAIProvider()
        elif self.provider_name == "gemini":
            self._provider = GeminiProvider()
        elif self.provider_name == "ollama":
            self._provider = OllamaProvider()
        else:
            self._provider = MockProvider()
        
        logger.info("AI Provider initialized: %s", self.provider_name)
        return self._provider

    async def execute_prompt(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> AIResponse:
        start_time = time.time()
        provider = self._get_provider()
        model_used = getattr(provider, "model", self.provider_name)

        # 1. Rate Limit Checks
        if not ai_rate_limiter.check_rate_limit():
            processing_time = time.time() - start_time
            return AIResponse(
                success=False,
                errors=["Rate limit exceeded. Maximum requests per minute reached."],
                processing_time=processing_time,
                model_used=model_used
            )

        # 2. Execution with Retries
        try:
            result = await retry_async(
                provider.generate,
                prompt=prompt,
                system_instruction=system_instruction
            )
            processing_time = time.time() - start_time
            
            logger.info(
                "AI execution completed successfully. Provider: %s, Model: %s, Processing Time: %.2f seconds",
                self.provider_name,
                result.get("model", model_used),
                processing_time
            )

            return AIResponse(
                success=True,
                data=result.get("text", ""),
                processing_time=processing_time,
                model_used=result.get("model", model_used)
            )

        except PermissionError as e:
            processing_time = time.time() - start_time
            logger.error("AI service authentication error: %s", str(e))
            return AIResponse(
                success=False,
                errors=["AI service authentication failure. Invalid API configurations."],
                processing_time=processing_time,
                model_used=model_used
            )
        except ConnectionError as e:
            processing_time = time.time() - start_time
            logger.error("AI service connection error: %s", str(e))
            return AIResponse(
                success=False,
                errors=["AI service temporarily unavailable. Please try again later."],
                processing_time=processing_time,
                model_used=model_used
            )
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error("AI service execution crashed: %s", str(e))
            return AIResponse(
                success=False,
                errors=["Unable to process your AI request. An unexpected error occurred."],
                processing_time=processing_time,
                model_used=model_used
            )

# Singleton service instance
ai_service = AIService()
