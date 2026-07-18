from sqlalchemy.orm import Session

class BaseService:
    """Base class for services to capture database session controls."""
    def __init__(self, db: Session):
        self.db = db
