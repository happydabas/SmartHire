import pytest
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.models.base import Base
import app.models as _models
from app.dependencies.db import get_db
from sqlalchemy.types import BigInteger
from sqlalchemy.ext.compiler import compiles

@compiles(BigInteger, "sqlite")
def compile_big_int_sqlite(type_, compiler, **kw):
    return "INTEGER"

# Use aiosqlite for asynchronous SQLite connections in tests
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

@pytest.fixture(scope="session", autouse=True)
def create_test_db():
    """Build schemas prior to starting test instances."""
    import asyncio
    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(init_db())
    yield
    async def drop_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_db())

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yields clean transaction sessions for database state assertions."""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
def client() -> Generator:
    """Configures the TestClient instance mapping dependency overrides to mock database sessions."""
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
