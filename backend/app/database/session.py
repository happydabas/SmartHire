from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from app.database.database import engine

# Config session local factory bound to our shared connection engine (using AsyncSession)
SessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Asynchronous context manager wrapper for DB sessions.
    Useful for background processes, celery, and standalone scripts.
    Handles transaction commits, rolls back automatically on error, and closes.
    """
    db = SessionLocal()
    try:
        yield db
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    finally:
        await db.close()
