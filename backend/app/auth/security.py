from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

# Declare OAuth2 security scheme to extract Bearer tokens from request headers
# Points to the login route path where requests obtain a token.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)
