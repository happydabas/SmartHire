import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.database.database import check_db_connection

# Initialize logging as early as possible
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    Handles startup configuration checks (like database connectivity verification) 
    and teardown events.
    """
    logger.info("Initializing SmartHire Backend services...")
    # Check Database connection at startup asynchronously
    db_connected = await check_db_connection()
    if db_connected:
        logger.info("PostgreSQL database connection successfully established.")
    else:
        logger.warning("PostgreSQL database is offline. Application degraded mode activated.")
        
    yield
    
    logger.info("Tearing down SmartHire Backend services...")

# Instantiate FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-powered Job Portal Backend API service",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}{settings.OPENAPI_URL}",
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
    lifespan=lifespan
)

# Apply CORS Middleware using parameters resolved in settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", summary="Root health endpoint")
async def root():
    """Root endpoint welcoming users and pointing to interactive documentation."""
    return {
        "success": True,
        "message": "SmartHire Backend API Service is running smoothly",
        "docs_url": settings.DOCS_URL,
        "version": settings.VERSION
    }

# --------------------------------------------------------------------------
# Exception Handlers
# --------------------------------------------------------------------------

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Intercept standard Starlette HTTP exceptions to return custom formatted errors."""
    logger.error(f"HTTP error encountered at {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "details": None
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Intercept request validation parameters errors."""
    errors = exc.errors()
    logger.warning(f"Validation failure at {request.url.path}: {errors}")
    
    # Sanitize errors to make sure they are JSON serializable
    sanitized_errors = []
    for err in errors:
        new_err = dict(err)
        if "ctx" in new_err and isinstance(new_err["ctx"], dict):
            new_err["ctx"] = {
                k: str(v) if isinstance(v, Exception) else v 
                for k, v in new_err["ctx"].items()
            }
        sanitized_errors.append(new_err)
        
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "Inbound request validation failed.",
                "details": sanitized_errors
            }
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Intercept database operations failures safely."""
    logger.error(f"Database transaction error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "success": False,
            "error": {
                "code": status.HTTP_503_SERVICE_UNAVAILABLE,
                "message": "Database transaction failure. Connection temporarily unavailable.",
                "details": None
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all top-level exception handler to prevent raw server stack trace leakage."""
    logger.error(f"Unhandled system error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "An unexpected error occurred on the server.",
                "details": None
            }
        }
    )
