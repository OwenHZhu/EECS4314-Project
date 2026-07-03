from datetime import datetime, timezone
from typing import Optional
from database.db import supabase
from schemas.library import LibraryEntryCreate, ReadingStatus


def add_or_update_library_entry(entry: LibraryEntryCreate, user_id: str) -> dict:
    """ 
    Add a book to a user's library, or update it if it already exists. 
    First checks whether the book exists in the book_catalogue table. 
    Then checks whether the same user has already added this book to their library. 
    
    If the library entry already exists, update its status, rating, and updated_at time. 
    If the entry does not exist, create a new library record. 
    
    Args: 
        entry: Validated LibraryEntryCreate object containing book_id, status, and optional rating.
        user_id: ID of the authenticated user from the JWT token.
        
    Returns: 
        Success: { "success": True, "message": str, "data": library_entry } 
        Failure: { "success": False, "message": str, "data": None } 
    """
    book_res = (supabase.table("book_catalogue").select("id").eq("id", entry.book_id).limit(1).execute())
    if not book_res.data:
        return {"success" : False, "message" : "Book does not exist", "data" : None}
    
    existing = (supabase.table("library").select("*").eq("user_id", user_id).eq("book_id", entry.book_id).limit(1).execute())
    now = datetime.now(timezone.utc).isoformat()

    if existing.data:
        update_data = {"status" : entry.status.value, "rating" : entry.rating, "updated_at" : now}
        res = (supabase.table("library").update(update_data).eq("user_id", user_id).eq("book_id", entry.book_id).execute())
        if not res.data:
            return {"success" : False, "message" : "Failed to update library", "data" : None}
        return {"success" : True, "message" : "Library updated successfully", "data" : res.data[0]}
    
    insert_data = {"user_id" : user_id, "book_id" : entry.book_id, "status" : entry.status.value, "rating" : entry.rating, "added_at" : now, "updated_at" : now}
    res = (supabase.table("library").insert(insert_data).execute())
    if not res.data:
        return {"success" : False, "message" : "Failed to add book to library", "data" : None}
    return{"success" : True, "message" : "Book added to library successfully", "data" : res.data[0]}

def get_user_library(user_id: str) -> dict:
    """ 
    Retrieve all library entries for a specific user. 
    
    Queries the library table using the provided user_id and returns all books 
    associated with that user's library. 
    
    Args: 
        user_id: ID of the user whose library should be retrieved. 
    
    Returns: 
        Success: { "success": True, "message": str, "data": list } 
        The data field contains all library entries that belong to the user. 
    """
    res = (supabase.table("library").select("*").eq("user_id", user_id).execute())
    return {"success" : True, "message" : "Library retrieved successfully", "data" : res.data}

def update_library(user_id: str, book_id: str, status: Optional[ReadingStatus] = None, rating: Optional[int] = None) -> dict:
    """ 
    Update a user's library entry for a specific book. 
    
    Can update the reading status, rating, or both. The function uses user_id 
    and book_id together to find the correct library entry. 
    
    If a rating is provided, it must be between 1 and 5. 
    The updated_at timestamp is refreshed whenever an update is made. 
    
    Args: 
        user_id: ID of the user who owns the library entry. 
        book_id: ID of the book being updated. 
        status: Optional new reading status. 
        rating: Optional new rating from 1 to 5. 
        
    Returns: 
        Success: { "success": True, "message": str, "data": updated_library_entry } 
        Failure: { "success": False, "message": str, "data": None } 
    """
    update_data = {"updated_at" : datetime.now(timezone.utc).isoformat()}
    
    if status is not None:
        update_data["status"] = status.value
    if rating is not None:
        if rating < 1 or rating > 5:
            return {"success" : False, "message" : "Rating must be between 1 and 5", "data" : None}
        update_data["rating"] = rating
    
    res = (supabase.table("library").update(update_data).eq("user_id", user_id).eq("book_id", book_id).execute())
    if not res.data:
        return {"success" : False, "message" : "Library entry not found", "data" : None}
    return {"success" : True, "message" : "Library entry updated successfully", "data" : res.data[0]}


def remove_library_entry(user_id: str, book_id: str) -> dict:
    """ 
    Remove a book from a user's library. 
    Deletes the library entry that matches the given user_id and book_id. 
    This only removes the user's library record. It does not delete the book 
    from the book_catalogue table. 
    
    Args: 
        user_id: ID of the user who owns the library entry. 
        book_id: ID of the book to remove from the user's library. 
        
    Returns: 
        Success: { "success": True, "message": str, "data": deleted_library_entry } 
        Failure: { "success": False, "message": str, "data": None } 
    """
    res = (supabase.table("library").delete().eq("user_id", user_id).eq("book_id", book_id).execute())
    if not res.data:
        return {"success" : False, "message" : "Library entry not found", "data" : None}
    return {"success" : True, "message" : "Book removed from library successfully", "data" : res.data[0]}