from datetime import datetime, timezone
from typing import Optional
from database.db import supabase
from schemas.library import LibraryEntry, ReadingStatus


def add_or_update_library_entry(entry: LibraryEntry) -> dict:
    book_res = (supabase.table("book_catalogue").select("id").eq("id", entry.book_id).limit(1).execute())
    if not book_res.data:
        return {"success" : False, "message" : "Book does not exist", "data" : None}
    
    existing = (supabase.table("library").select("*").eq("user_id", entry.user_id).eq("book_id", entry.book_id).limit(1).execute())
    now = datetime.now(timezone.utc).isoformat()

    if existing.data:
        update_data = {"status" : entry.status.value, "rating" : entry.rating, "updated_at" : now}
        res = (supabase.table("library").update(update_data).eq("user_id", entry.user_id).eq("book_id", entry.book_id).execute())
        if not res.data:
            return {"success" : False, "message" : "Failed to update library", "data" : None}
        return {"success" : True, "message" : "Library updated successfully", "data" : res.data[0]}
    
    insert_data = {"user_id" : entry.user_id, "book_id" : entry.book_id, "status" : entry.status.value, "rating" : entry.rating, "added_at" : now, "updated_at" : now}
    res = (supabase.table("library").insert(insert_data).execute())
    if not res.data:
        return {"success" : False, "message" : "Failed to add book to library", "data" : None}
    return{"success" : True, "message" : "Book added to library successfully", "data" : res.data[0]}
