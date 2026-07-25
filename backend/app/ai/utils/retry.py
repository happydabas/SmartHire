import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger("app.ai.retry")

async def retry_async(
    func: Callable,
    *args,
    retries: int = 3,
    initial_delay: float = 1.0,
    backoff: float = 2.0,
    **kwargs
) -> Any:
    """
    Retry transient errors with exponential backoff.
    Does NOT retry auth/permission errors or invalid requests.
    """
    delay = initial_delay
    for attempt in range(1, retries + 1):
        try:
            return await func(*args, **kwargs)
        except (PermissionError, ValueError) as e:
            logger.error("Fatal AI execution error, skipping retry: %s", str(e))
            raise e
        except Exception as e:
            if attempt == retries:
                logger.error("Max AI retries reached (%d). Raising exception.", retries)
                raise e
            logger.warning(
                "Attempt %d failed: %s. Retrying in %.2f seconds...",
                attempt,
                str(e),
                delay
            )
            await asyncio.sleep(delay)
            delay *= backoff
