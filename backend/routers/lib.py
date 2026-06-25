from fastapi import APIRouter, HTTPException
from schemas.library import LibraryEntryCreate, LibraryEntryUpdate
from services.lib_service import (
    add_or_update_library_entry,
    get_user_library,
    update_library,
    remove_library_entry
)


router = APIRouter(prefix="/library", tags=["Library"])


@router.post("")
def add_or_update_entry(entry: LibraryEntryCreate):
    """
    Add a book to a user's library, or update it if it already exists.

    Receives a LibraryEntryCreate request body from the frontend.
    The request contains user_id, book_id, reading status, and optional rating.

    The actual business logic is handled by add_or_update_library_entry()
    in the library service layer.

    Raises:
        HTTPException 400: If the book does not exist or the library entry
        cannot be added or updated.

    Returns:
        The inserted or updated library entry.
    """
    result = add_or_update_library_entry(entry)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.get("/{user_id}")
def get_library(user_id: str):
    """
    Get all library entries for a specific user.

    Receives user_id from the URL path and passes it to the service layer.
    The service returns all books currently stored in that user's library.

    Args:
        user_id: ID of the user whose library should be retrieved.

    Raises:
        HTTPException 400: If the library cannot be retrieved.

    Returns:
        A list of library entries for the user.
    """

    result = get_user_library(user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.patch("/update")
def update_entry(entry: LibraryEntryUpdate):
    """
    Update an existing library entry.

    Receives a LibraryEntryUpdate request body from the frontend.
    user_id and book_id are used to find the correct library entry.
    status and rating are optional, so the frontend can update one or both fields.

    The actual update logic is handled by update_library()
    in the library service layer.

    Raises:
        HTTPException 404: If the library entry is not found or cannot be updated.

    Returns:
        The updated library entry.
    """

    result = update_library(
        user_id=entry.user_id,
        book_id=entry.book_id,
        status=entry.status,
        rating=entry.rating
    )
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result["data"]


@router.delete("/{user_id}/{book_id}")
def remove_entry(user_id: str, book_id: str):
    """
    Remove a book from a user's library.

    Receives user_id and book_id from the URL path.
    These two IDs are used together to find and delete the correct library entry.

    This only removes the user's library record.
    It does not delete the book from the book_catalogue table.

    Args:
        user_id: ID of the user who owns the library entry.
        book_id: ID of the book to remove from the user's library.

    Raises:
        HTTPException 404: If the library entry is not found.

    Returns:
        The deleted library entry.
    """
    
    result = remove_library_entry(user_id, book_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]

