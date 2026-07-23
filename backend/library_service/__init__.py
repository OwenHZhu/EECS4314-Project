"""
library_service package.

Standalone BookAtlas Library Service.

This package contains the FastAPI entrypoint, routers, schemas, and business
logic for managing each user's personal library, including reading status,
wishlist/favourites, and ratings.

Run from backend/ with:

    uvicorn library_service.library_service:app --reload --port 8003
"""