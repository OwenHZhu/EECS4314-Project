"""
routers/books.py

Defines all Book Service-related API routes for BookAtlas.
Handles HTTP requests, validation, and hands logic off to the book_service.
"""

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field, UUID4
from typing import Optional

# Import the new service functions
from services.book_service import (
    add_book,
    update_book,
    delete_book,
    rate_book,
    get_all_books,
    get_book_by_id
)

router = APIRouter()

# Schemas for book creation, updates, and rating submissions

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

# Routes for managing the global book catalog (CRUD operations)

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_book_route(book: BookCreate):
    """Adds a new book to the global catalog."""
    result = add_book(book.model_dump())
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return result["data"]

@router.patch("/{book_id}")
def update_book_route(book_id: UUID4, book_update: BookUpdate):
    """Updates an existing book's details."""
    result = update_book(str(book_id), book_update.model_dump())
    if not result["success"]:
        # Choose the right error code based on the service message
        status_code = 400 if "No valid fields" in result["message"] else 404
        if "Database error" in result["message"]:
            status_code = 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return result["data"]

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_route(book_id: UUID4):
    """Removes a book from the catalog entirely."""
    result = delete_book(str(book_id))
    if not result["success"]:
        status_code = 404 if "not found" in result["message"] else 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return {"message": result["message"]}

@router.post("/{book_id}/rate")
def rate_book_route(book_id: UUID4, rating_data: BookRate):
    """Submits a user rating for a book."""
    result = rate_book(str(book_id), str(rating_data.user_id), rating_data.rating)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"message": result["message"], "data": result.get("data")}

@router.get("/")
def get_books_route(q: Optional[str] = Query(None, description="Search by title or author"), limit: int = 50):
    """Fetches a list of books, with an optional search query."""
    result = get_all_books(q, limit)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"data": result.get("data")}
    
@router.get("/{book_id}")
def get_book_by_id_route(book_id: UUID4):
    """Fetches full details for a single book by its ID."""
    result = get_book_by_id(str(book_id))
    if not result["success"]:
        status_code = 404 if "not found" in result["message"] else 500
        raise HTTPException(status_code=status_code, detail=result["message"])
    return {"data": result.get("data")}