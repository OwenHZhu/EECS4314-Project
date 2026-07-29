"""
auth_service.py

Standalone entrypoint for the BookAtlas Auth Service.

This service owns all authentication logic: registration, login, logout,
and session/profile retrieval. It runs independently from the other
BookAtlas services (book_service, discussion_service, etc.) on its own
port, so it can be deployed, scaled, and restarted without affecting them.

Shared resources: - database/ (at the repo root, one level up) is shared across all
services. This service imports it via a relative path — it does NOT
duplicate the database module.

Read __init__.py on instructions on how to run the service.

Environment variables required (see .env.example):
SUPABASE_URL
SUPABASE_KEY
JWT_SECRET
"""

import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth_service.routers.register import router as register_router
from auth_service.routers.login import router as login_router
from auth_service.routers.account import router as account_router
from auth_service.routers.profile_picture import router as profile_picture_router
from auth_service.routers.users import router as users_router
from shared.constants import ORIGINS

app = FastAPI(
    title="BookAtlas Auth Service",
    description="Handles user registration, login, logout, and session retrieval.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All routers are mounted under /api/v1/auth (prefix set inside each router)
app.include_router(register_router, prefix="/api/v1")
app.include_router(login_router, prefix="/api/v1")
app.include_router(account_router, prefix="/api/v1")
app.include_router(profile_picture_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    """Basic liveness check for load balancers / uptime monitors."""
    return {"status": "ok", "service": "auth_service"}


if __name__ == "__main__":
      uvicorn.run("auth_service.auth_service:app", host="0.0.0.0", port=8000, reload=True)