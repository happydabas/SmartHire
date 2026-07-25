from typing import Any, Optional, List
from pydantic import BaseModel

class AIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
    processing_time: float
    model_used: str
