from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import SessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an AsyncSession.
    Ensures that connections are closed and returned to the pool once request finishes.
    """
    async with SessionLocal() as db:
        yield db
