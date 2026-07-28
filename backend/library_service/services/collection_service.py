from datetime import datetime, timezone

from shared.db import supabase
from library_service.schemas.collection import CollectionCreate, CollectionUpdate


def create_collection(collection: CollectionCreate, user_id: str) -> dict:
    """
    Create a custom collection for the authenticated user.

    Args:
        collection: Validated CollectionCreate object containing the name and
                    optional description.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection }
        Failure: { "success": False, "message": str, "data": None }
    """
    name = collection.name.strip()
    if not name:
        return {"success": False, "message": "Collection name cannot be empty", "data": None}

    now = datetime.now(timezone.utc).isoformat()
    insert_data = {
        "user_id": user_id,
        "name": name,
        "description": collection.description,
        "created_at": now,
        "updated_at": now
    }

    res = supabase.table("collections").insert(insert_data).execute()
    if not res.data:
        return {"success": False, "message": "Failed to create collection", "data": None}

    return {
        "success": True,
        "message": "Collection created successfully",
        "data": res.data[0]
    }


def get_user_collections(user_id: str) -> dict:
    """
    Retrieve all custom collections owned by the authenticated user.

    Args:
        user_id: ID of the authenticated user whose collections should be
                 retrieved.

    Returns:
        Success: { "success": True, "message": str, "data": list }
    """
    res = (supabase.table("collections").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute())

    return {
        "success": True,
        "message": "Collections retrieved successfully",
        "data": res.data
    }


def get_collection(collection_id: str, user_id: str) -> dict:
    """
    Retrieve one collection and its books.

    The collection ID and authenticated user ID are checked together so a user
    cannot retrieve another user's private collection.

    Args:
        collection_id: ID of the collection to retrieve.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection }
        Failure: { "success": False, "message": str, "data": None }
    """
    res = (supabase.table("collections").select("*, collection_books(*, book:book_catalogue(*))").eq("id", collection_id).eq("user_id", user_id).limit(1).execute())

    if not res.data:
        return {"success": False, "message": "Collection not found", "data": None}

    return {
        "success": True,
        "message": "Collection retrieved successfully",
        "data": res.data[0]
    }


def update_collection(collection_id: str, collection: CollectionUpdate, user_id: str) -> dict:
    """
    Update a collection owned by the authenticated user.

    The request can update the name, description, or both. An explicitly null
    description clears the current description.

    Args:
        collection_id: ID of the collection to update.
        collection: Validated CollectionUpdate object.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection }
        Failure: { "success": False, "message": str, "data": None }
    """
    update_data = {}

    if "name" in collection.model_fields_set:
        if collection.name is None or not collection.name.strip():
            return {"success": False, "message": "Collection name cannot be empty", "data": None}
        update_data["name"] = collection.name.strip()

    if "description" in collection.model_fields_set:
        update_data["description"] = collection.description

    if not update_data:
        return {"success": False, "message": "No update data provided", "data": None}

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    res = (supabase.table("collections").update(update_data).eq("id", collection_id).eq("user_id", user_id).execute())

    if not res.data:
        return {"success": False, "message": "Collection not found", "data": None}

    return {
        "success": True,
        "message": "Collection updated successfully",
        "data": res.data[0]
    }


def delete_collection(collection_id: str, user_id: str) -> dict:
    """
    Delete a collection owned by the authenticated user.

    Deleting a collection only deletes its collection record and associated
    collection_books rows. It does not delete books from book_catalogue or the
    user's library.

    Args:
        collection_id: ID of the collection to delete.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection }
        Failure: { "success": False, "message": str, "data": None }
    """
    res = (supabase.table("collections").delete().eq("id", collection_id).eq("user_id", user_id).execute())

    if not res.data:
        return {"success": False, "message": "Collection not found", "data": None}

    return {
        "success": True,
        "message": "Collection deleted successfully",
        "data": res.data[0]
    }


def add_book_to_collection(collection_id: str, book_id: str, user_id: str) -> dict:
    """
    Add one of the authenticated user's library books to a collection.

    The collection must belong to the authenticated user and the book must
    already exist in that user's library. The same book cannot be added to the
    same collection more than once.

    Args:
        collection_id: ID of the collection receiving the book.
        book_id: ID of the book to add.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection_book }
        Failure: { "success": False, "message": str, "data": None }
    """
    collection_res = (supabase.table("collections").select("id").eq("id", collection_id).eq("user_id", user_id).limit(1).execute())
    if not collection_res.data:
        return {"success": False, "message": "Collection not found", "data": None}

    library_res = (supabase.table("library").select("book_id").eq("user_id", user_id).eq("book_id", book_id).limit(1).execute())
    if not library_res.data:
        return {"success": False, "message": "Book is not in the user's library", "data": None}

    existing = (supabase.table("collection_books").select("collection_id, book_id").eq("collection_id", collection_id).eq("book_id", book_id).limit(1).execute())
    if existing.data:
        return {"success": False, "message": "Book is already in this collection", "data": None}

    now = datetime.now(timezone.utc).isoformat()
    insert_data = {
        "collection_id": collection_id,
        "book_id": book_id,
        "added_at": now
    }

    res = supabase.table("collection_books").insert(insert_data).execute()
    if not res.data:
        return {"success": False, "message": "Failed to add book to collection", "data": None}

    (supabase.table("collections").update({"updated_at": now}).eq("id", collection_id).eq("user_id", user_id).execute())

    return {
        "success": True,
        "message": "Book added to collection successfully",
        "data": res.data[0]
    }


def remove_book_from_collection(collection_id: str, book_id: str, user_id: str) -> dict:
    """
    Remove a book from a collection owned by the authenticated user.

    This only removes the collection_books relationship. It does not remove
    the book from the user's library or from book_catalogue.

    Args:
        collection_id: ID of the collection containing the book.
        book_id: ID of the book to remove.
        user_id: ID of the authenticated user from the JWT token.

    Returns:
        Success: { "success": True, "message": str, "data": collection_book }
        Failure: { "success": False, "message": str, "data": None }
    """
    collection_res = (supabase.table("collections").select("id").eq("id", collection_id).eq("user_id", user_id).limit(1).execute())
    if not collection_res.data:
        return {"success": False, "message": "Collection not found", "data": None}

    res = (supabase.table("collection_books").delete().eq("collection_id", collection_id).eq("book_id", book_id).execute())
    if not res.data:
        return {"success": False, "message": "Book is not in this collection", "data": None}

    now = datetime.now(timezone.utc).isoformat()
    (supabase.table("collections").update({"updated_at": now}).eq("id", collection_id).eq("user_id", user_id).execute())

    return {
        "success": True,
        "message": "Book removed from collection successfully",
        "data": res.data[0]
    }
