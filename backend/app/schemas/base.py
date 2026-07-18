from pydantic import BaseModel, ConfigDict

class BaseSchema(BaseModel):
    """Pydantic v2 Base schema setting configurations globally."""
    model_config = ConfigDict(
        from_attributes=True,  # Enables loading from SQLAlchemy ORM instances
        populate_by_name=True, # Allows camelCase alias mappings
        validate_assignment=True
    )
