import logging
import logging.config
import sys
from app.core.config import settings

def setup_logging() -> None:
    """
    Configures application-wide logging formats and outputs using standard dictConfig.
    Ensures standard logs go to stdout for container environments compatibility (Twelve-Factor App).
    """
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": settings.LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "default",
                "level": settings.LOG_LEVEL,
            },
        },
        "loggers": {
            # Root Logger
            "": {
                "handlers": ["console"],
                "level": settings.LOG_LEVEL,
            },
            # Uvicorn Loggers
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "INFO",
                "propagate": True,
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            # SQLAlchemy Logger
            "sqlalchemy.engine": {
                "handlers": ["console"],
                "level": "WARNING",
                "propagate": False,
            },
        },
    }

    logging.config.dictConfig(logging_config)
