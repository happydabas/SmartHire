import pytest
from typing import AsyncGenerator, Generator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database.database import Base
from app.dependencies.db import get_db

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
async def create_test_db():
    """Build schemas prior to starting test instances asynchronously."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yields clean transaction sessions for database state assertions."""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
def client(db_session) -> Generator:
    """Configures the TestClient instance mapping dependency overrides to mock database sessions."""
    async def override_get_db():
        yield db_session
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
