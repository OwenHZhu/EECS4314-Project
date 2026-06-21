"""
services/book_service.py

Business logic for the Book Service (Global Catalog).
Handles all interactions with the Supabase `book_catalogue` table.

Returns a consistent response dictionary to the router:
    {
        "success": bool,
        "message": str,
        "data": dict | list | None
    }
"""

from typing import Optional
from database.db import supabase

def get_all_books(q: Optional[str] = None, limit: int = 50) -> dict:
    """Fetches books from the catalog, optionally filtering by a search query."""
    try:
        query = supabase.table("book_catalogue").select("*")
        if q:
            query = query.ilike("title", f"%{q}%")
            
        res = query.limit(limit).execute()
        return {"success": True, "message": "Books fetched successfully", "data": res.data}
    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def get_book_by_id(book_id: str) -> dict:
    """Fetches full details for a single book by its ID."""
    try:
        res = supabase.table("book_catalogue").select("*").eq("id", str(book_id)).execute()
        if not res.data:
            return {"success": False, "message": "Book not found", "data": None}
            
        return {"success": True, "message": "Book fetched successfully", "data": res.data[0]}
    except Exception as e:
        return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def add_book(book_data: dict) -> dict:
    """Adds a new book to the global catalog."""
    try:
        res = supabase.table("book_catalogue").insert(book_data).execute()
        if not res.data:
            return {"success": False, "message": "Failed to add book", "data": None}
            
        return {"success": True, "message": "Book added successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def update_book(book_id: str, update_data: dict) -> dict:
    """Updates an existing book's details."""
    try:
        res = supabase.table("book_catalogue").update(update_data).eq("id", str(book_id)).execute()
        if not res.data:
            return {"success": False, "message": "Book not found or update failed", "data": None}
            
        return {"success": True, "message": "Book updated successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def delete_book(book_id: str) -> dict:
    """Permanently deletes a book from the catalog."""
    try:
        res = supabase.table("book_catalogue").delete().eq("id", str(book_id)).execute()
        if not res.data:
             return {"success": False, "message": "Book not found or already deleted", "data": None}
             
        return {"success": True, "message": "Book deleted successfully", "data": res.data[0]}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}

def rate_book(book_id: str, rating_data: dict) -> dict:
    """Adds a user rating for a specific book."""
    try:
        # Assuming you have a book_ratings table. Adjust if it updates the catalog directly!
        payload = {**rating_data, "book_id": str(book_id)}
        res = supabase.table("book_ratings").insert(payload).execute()
        
        return {"success": True, "message": "Book rated successfully", "data": res.data}
    except Exception as e:
         return {"success": False, "message": f"Database error: {str(e)}", "data": None}