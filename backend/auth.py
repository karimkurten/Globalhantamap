"""JWT auth utilities for Global Hanta Map admin.

Tokens are issued as both:
 - HttpOnly + Secure + SameSite=Lax cookie (`hanta_admin_session`) — primary, XSS-resistant
 - Authorization: Bearer header (returned in JSON for API clients & tests)

`get_current_admin` accepts either source.
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")
JWT_ALG = "HS256"
ACCESS_TOKEN_EXPIRES_MIN = 60 * 12  # 12 hours
COOKIE_NAME = "hanta_admin_session"
COOKIE_MAX_AGE = ACCESS_TOKEN_EXPIRES_MIN * 60
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"

# auto_error=False so missing Bearer header doesn't 401 before we can check cookie
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRES_MIN) -> str:
    payload = data.copy()
    payload.update({
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
        "iat": datetime.now(timezone.utc),
    })
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        return None


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


async def get_current_admin(
    request: Request,
    bearer: Optional[str] = Depends(oauth2_scheme),
) -> dict:
    """Resolve admin from HttpOnly cookie first, else Authorization Bearer header."""
    token = request.cookies.get(COOKIE_NAME) or bearer
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload
