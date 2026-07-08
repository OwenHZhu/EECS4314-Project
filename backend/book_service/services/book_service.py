"""
services/book_service.py

Business logic for the Book Service (Global Catalog).
Handles all interactions with the Supabase `book_catalogue` and `book_ratings` tables.

This service sits between the router (routers/books.py) and the database (Supabase).
The router handles HTTP — this file handles the actual database queries.

All functions return a consistent response shape:
    {
        "success": bool,
        "message": str,
        "data":    dict | list | None
    }

Errors are returned as { "success": False, ... } rather than raising exceptions —
the router is responsible for converting these into HTTP error responses.

Functions:
    get_all_books  - Fetch all books with optional search filtering
    get_book_by_id - Fetch a single book's details by UUID
    add_book       - Add a new book to the catalog
    update_book    - Update specific fields of an existing book
    delete_book    - Remove a book from the catalog entirely
    rate_book      - Submit a user rating for a book

Dependencies:
    database/db.py - supabase (Supabase client)
"""

import uuid
from typing import Optional
from database.db import supabase

def get_all_books(q: Optional[str] = None, limit: int = 50) -> dict:
    """
    Fetches books from the catalog, optionally filtering by a search query.

    If a query string `q` is provided, it uses PostgreSQL's `ilike` to perform 
    a case-insensitive search against the book titles. Limits the result set 
    to prevent massive data payloads.

    Args:
        q: Optional search string for the book title.
        limit: Maximum number of records to return (default 50).

    Returns:
        Success: { success: True, message: str, data: list }
        Failure: { success: False, message: str, data: None }
    """
    try:
        query = supabase.table("book_catalogue").select("*")
        if q:
            query = query.ilike("title", f"%{q}%")
            
        res = query.limit(limit).execute()
        return {"success": True, "message": "Books fetched successfully", "data": res.data}
    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def get_book_by_id(book_id: str) -> dict:
    """
    Fetches full details for a single book by its ID.

    Args:
        book_id: The UUID string of the target book.

    Returns:
        Success: { success: True, message: str, data: dict }
        Failure: { success: False, message: "Book not found" | error, data: None }
    """
    try:
        res = supabase.table("book_catalogue").select("*").eq("id", book_id).execute()
        if not res.data:
            return {"success": False, "message": "Book not found", "data": None}
            
        return {"success": True, "message": "Book fetched successfully", "data": res.data[0]}
    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def add_book(book_data: dict) -> dict:
    """
    Adds a new book to the global catalog.

    Automatically generates a manual `external_id` (since the database seed script 
    usually relies on external IDs from APIs like Open Library).

    Args:
        book_data: Dictionary containing title, author, and optional fields.

    Returns:
        Success: { success: True, message: str, data: dict }
        Failure: { success: False, message: str, data: None }
    """
    # Generate a fake external_id for manually added books to satisfy DB constraints
    book_data["external_id"] = f"manual_{uuid.uuid4().hex[:8]}" 
    
    try:
        res = supabase.table("book_catalogue").insert(book_data).execute()
        if not res.data:
            return {"success": False, "message": "Failed to add book", "data": None}
            
        return {"success": True, "message": "Book added successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def update_book(book_id: str, update_data: dict) -> dict:
    """
    Updates an existing book's details.

    Cleans the incoming data by dropping any `None` values to ensure we don't 
    accidentally overwrite existing database fields with empty nulls.

    Args:
        book_id: The UUID string of the target book.
        update_data: Dictionary containing the fields to update.

    Returns:
        Success: { success: True, message: str, data: dict }
        Failure: { success: False, message: str, data: None }
    """
    # Drop any None values so we don't overwrite existing data with nulls
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not clean_data:
        return {"success": False, "message": "No valid fields provided for update", "data": None}
        
    try:
        res = supabase.table("book_catalogue").update(clean_data).eq("id", book_id).execute()
        if not res.data:
            return {"success": False, "message": "Book not found or update failed", "data": None}
            
        return {"success": True, "message": "Book updated successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def delete_book(book_id: str) -> dict:
    """
    Permanently deletes a book from the catalog.

    Args:
        book_id: The UUID string of the target book.

    Returns:
        Success: { success: True, message: str, data: dict }
        Failure: { success: False, message: str, data: None }
    """
    try:
        res = supabase.table("book_catalogue").delete().eq("id", book_id).execute()
        if not res.data:
             return {"success": False, "message": "Book not found or already deleted", "data": None}
             
        return {"success": True, "message": "Book deleted successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def rate_book(book_id: str, user_id: str, rating_value: int) -> dict:
    """
    Submits a user rating for a specific book.

    Uses an `upsert` operation with conflict resolution on `book_id, user_id` 
    to ensure a user can only rate a book once. Subsequent ratings from the same 
    user will update their existing score.

    Args:
        book_id: The UUID string of the target book.
        user_id: The UUID string of the user submitting the rating.
        rating_value: Integer between 1 and 5.

    Returns:
        Success: { success: True, message: str, data: dict }
        Failure: { success: False, message: str, data: None }
    """
    try:
        rating_insert = {
            "book_id": book_id,
            "user_id": user_id,
            "rating_value": rating_value
        }
        
        res = supabase.table("book_ratings").upsert(
            rating_insert, 
            on_conflict="book_id, user_id" # Prevents duplicate ratings
        ).execute()
        
        return {"success": True, "message": "Book rated successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}