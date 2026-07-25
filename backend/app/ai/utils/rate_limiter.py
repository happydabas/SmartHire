import time
import logging
from app.core.config import settings

logger = logging.getLogger("app.ai.ratelimiter")

class SimpleRateLimiter:
    def __init__(self):
        self.requests_per_minute = settings.AI_REQUESTS_PER_MINUTE
        self.request_timestamps = []

    def check_rate_limit(self) -> bool:
        """
        Returns True if request is allowed, False otherwise.
        """
        now = time.time()
        self.request_timestamps = [t for t in self.request_timestamps if now - t < 60]
        
        if len(self.request_timestamps) >= self.requests_per_minute:
            logger.warning("AI API Rate Limit reached: max %d requests per minute", self.requests_per_minute)
            return False
            
        self.request_timestamps.append(now)
        return True

# Singleton rate limiter
ai_rate_limiter = SimpleRateLimiter()
