"""
routers/books.py

Defines all Book Service-related API routes for BookAtlas.
Handles HTTP requests, data validation (via Pydantic), and hands logic 
off to the book_service.

All routes are prefixed with /api/v1/books (set in main.py).

Public routes:
    GET    /books/               - Get a list of books (supports search via ?q=)
    GET    /books/{book_id}      - Get full details for a specific book
    POST   /books/               - Add a new book to the catalog
    PATCH  /books/{book_id}      - Update an existing book's details
    DELETE /books/{book_id}      - Remove a book
    POST   /books/{book_id}/rate - Submit a 1-5 star rating for a book

Dependencies:
    services/book_service.py - Core database logic
    pydantic                 - Data validation schemas (BookCreate, BookUpdate, BookRate)
"""

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field, UUID4
from typing import Optional

# Import the service functions
from services.book_service import (
    add_book,
    update_book,
    delete_book,
    rate_book,
    get_all_books,
    get_book_by_id
)

router = APIRouter()

# ==========================================
# Schemas for Validation
# ==========================================

class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    author: str
    description: Optional[str] = None
    isbn: Optional[str] = None
    cover_image: Optional[str] = None

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None

class BookRate(BaseModel):
    user_id: UUID4
    rating: int = Field(ge=1, le=5, description="Rating between 1 and 5 stars")


# ==========================================
# Routes (CRUD Operations)
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_book_route(book: BookCreate):
    """
    Adds a new book to the global catalog.

    - Validates incoming payload using the BookCreate schema.
    - Hands data off to the service layer for insertion.
    - Returns 201 Created and the new book object on success.
    - Returns 500 if database insertion fails.
    """
    result = add_book(book.model_dump())
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return result["data"]

@router.patch("/{book_id}")
def update_book_route(book_id: UUID4, book_update: BookUpdate):
    """
    Updates an existing book's details.

    - Allows partial updates via BookUpdate schema (all fields optional).
    - Service layer cleans out null values automatically.
    - Returns 404 if the book doesn't exist, or 400 if no valid fields are passed.
    """
    result = update_book(str(book_id), book_update.model_dump())
    if not result["success"]:
        status_code = 400 if "No valid fields" in result["message"] else 404
        if "Database error" in result["message"]:
            status_code = 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return result["data"]

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_route(book_id: UUID4):
    """
    Removes a book from the catalog entirely.

    - Calls the service layer to delete the row from Supabase.
    - Returns a 204 No Content status on success (standard for DELETE ops).
    - Returns 404 if the book was not found.
    """
    result = delete_book(str(book_id))
    if not result["success"]:
        status_code = 404 if "not found" in result["message"] else 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return {"message": result["message"]}

@router.post("/{book_id}/rate")
def rate_book_route(book_id: UUID4, rating_data: BookRate):
    """
    Submits a user rating for a book.

    - Enforces rating validation (1-5) via BookRate schema.
    - Uses upsert logic in the service layer to prevent duplicate user ratings.
    - Returns 500 if the database insert/update fails.
    """
    result = rate_book(str(book_id), str(rating_data.user_id), rating_data.rating)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"message": result["message"], "data": result.get("data")}

@router.get("/")
def get_books_route(q: Optional[str] = Query(None, description="Search by title or author"), limit: int = 50):
    """
    Fetches a list of books, with an optional search query.

    - Accepts an optional `?q=...` URL parameter to filter results.
    - Hands off the query term to the service layer for PostgreSQL `ilike` searching.
    - Defaults to a limit of 50 items.
    """
    result = get_all_books(q, limit)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"data": result.get("data")}
    
@router.get("/{book_id}")
def get_book_by_id_route(book_id: UUID4):
    """
    Fetches full details for a single book by its ID.

    - Passes the UUID string to the service layer.
    - Returns 404 if no book matches the given ID.
    """
    result = get_book_by_id(str(book_id))
    if not result["success"]:
        status_code = 404 if "not found" in result["message"] else 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return {"data": result.get("data")}