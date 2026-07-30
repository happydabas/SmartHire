import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application Settings class.
    Automatically parses configuration parameters from environment variables or .env file.
    Organized into logical sections for scalability.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # ==========================================
    # 1. Application Settings
    # ==========================================
    PROJECT_NAME: str = "SmartHire API"
    VERSION: str = "0.1.0"
    ENV: str = "development"  # e.g., development, staging, production
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # Swagger & ReDoc UI configurations
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"

    # ==========================================
    # 2. CORS Settings
    # ==========================================
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Add deployed frontend origins here (Netlify/Vercel/etc.)
        "https://smarthire-jobs.netlify.app",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # ==========================================
    # 3. Logging Settings
    # ==========================================
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # ==========================================
    # 4. Database Settings
    # ==========================================
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/smarthire"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_PRE_PING: bool = True

    # ==========================================
    # 5. JWT Authentication Settings
    # ==========================================
    JWT_SECRET_KEY: str = "placeholder_secret_key_change_me"
    JWT_REFRESH_SECRET_KEY: str = "placeholder_refresh_secret_key_change_me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ==========================================
    # 6. Email Settings (Placeholder)
    # ==========================================
    SMTP_HOST: str = "smtp.mailtrap.io"
    SMTP_PORT: int = 2525
    SMTP_USER: str = "placeholder_smtp_user"
    SMTP_PASSWORD: str = "placeholder_smtp_password"
    EMAILS_FROM_EMAIL: str = "no-reply@smarthire.com"

    # ==========================================
    # 7. File Upload Settings (Placeholder)
    # ==========================================
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB in bytes
    UPLOAD_DIR: str = "app/uploads"

    # ==========================================
    # 8. AI Foundation Settings
    # ==========================================
    AI_PROVIDER: str = "mock"
    AI_API_KEY: str = "mock-key"
    AI_MODEL: str = "mock-model"
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 1000
    AI_TIMEOUT: float = 30.0
    AI_REQUESTS_PER_MINUTE: int = 60

settings = Settings()
