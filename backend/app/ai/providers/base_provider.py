from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate text completion based on prompt and system instruction.
        Returns a dictionary containing 'text' response and optional token/usage data.
        """
        pass
