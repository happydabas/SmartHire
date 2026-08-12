import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure SQLAlchemy 2.0 connection engine using the async database engine
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=False,
    pool_recycle=300,
    pool_use_lifo=True,
    connect_args={"statement_cache_size": 0},
    echo=False
)

# Shared Declarative Base instance for DB entities
Base = declarative_base()

async def check_db_connection() -> bool:
    """
    Executes a raw SQL query ('SELECT 1') asynchronously to verify database health.
    Used during startup diagnostics checks and by the health status api route.
    """
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connectivity check failed: {e}")
        return False
