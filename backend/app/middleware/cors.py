from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import time

class RequestTimeLoggingMiddleware(BaseHTTPMiddleware):
    """Custom middleware example to log the duration processing a request."""
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
