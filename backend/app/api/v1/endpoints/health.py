from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import check_db_connection
from app.dependencies.db import get_db

router = APIRouter()

@router.get("", tags=["Health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Status check endpoint.
    Performs dynamic diagnostics verifying PostgreSQL database connectivity asynchronously.
    """
    is_db_connected = await check_db_connection()
    status = "healthy" if is_db_connected else "degraded"
    
    return {
        "status": status,
        "database": "connected" if is_db_connected else "disconnected",
        "api_status": "online"
    }
