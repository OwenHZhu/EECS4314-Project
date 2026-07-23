"""
book_service.py

Standalone entrypoint for the BookAtlas Book Service.

This service owns all book catalogue logic and library stat aggregations. 
It runs independently from the other BookAtlas services on its own port, 
so it can be deployed, scaled, and restarted without affecting them.

Shared resources: - database/ (at the repo root, one level up) is shared across all
services. This service imports it via a relative path — it does NOT
duplicate the database module.

Environment variables required (see .env.example):
SUPABASE_URL
SUPABASE_KEY
"""

import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from book_service.routers.books import router as books_router
from shared.constants import ORIGINS

app = FastAPI(
    title="Book Service API",
    description="Manages the global catalogue of books and aggregates real-time user engagement metrics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach just the book routers to this specific app
app.include_router(books_router, prefix="/api/v1/books")


@app.get("/health", tags=["Health"])
def health_check():
    """Basic liveness check for load balancers / uptime monitors."""
    return {"status": "ok", "service": "book_service"}


if __name__ == "__main__":
    uvicorn.run("book_service.book_service:app", host="0.0.0.0", port=8001, reload=True)