"""
auth_service/__init__.py

Marks this folder as a Python package so it can be imported as
auth_service.auth_service, auth_service.routers.register, etc.
from the repo root (backend/).

This file is intentionally left otherwise empty — no logic or re-exports
live here. All imports throughout this service are absolute and rooted
at the repo root (backend/), e.g.:

    from auth_service.routers.register import router
    from auth_service.services.auth import register_user
    from shared.database import supabase

For these imports to resolve, this service must always be run from the
repo root (backend/), never from inside auth_service/ itself.

Run locally (from backend/):

    python -m auth_service.auth_service

or, using uvicorn directly:

    uvicorn auth_service.auth_service:app --reload --port 8001
"""