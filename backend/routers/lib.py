from fastapi import APIRouter, HTTPException, Depends
from utils.jwt import get_current_user_id
from schemas.library import LibraryEntryCreate, LibraryEntryUpdate
from services.lib_service import (
    add_or_update_library_entry,
    get_user_library,
    update_library,
    remove_library_entry
)


router = APIRouter(prefix="/library", tags=["Library"])


@router.post("")
def add_or_update_entry(entry: LibraryEntryCreate, user_id: str = Depends(get_current_user_id)):
    """
    Add a book to the authenticated user's library, or update it if it already exists.

    Receives a LibraryEntryCreate request body from the frontend.
    The request contains book_id, reading status, and optional rating.

    user_id comes from the JWT token, not from the frontend request body.

    The actual business logic is handled by add_or_update_library_entry()
    in the library service layer.

    Raises:
        HTTPException 400: If the book does not exist or the library entry
        cannot be added or updated.

    Returns:
        The inserted or updated library entry.
    """
    result = add_or_update_library_entry(entry, user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.get("")
def get_library(user_id: str = Depends(get_current_user_id)):
    """
    Get all library entries for the authenticated user.

    Gets user_id from the JWT token and passes it to the service layer.
    The service returns all books currently stored in that user's library.

    Args:
        user_id: ID of the authenticated user whose library should be retrieved.

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
def update_entry(entry: LibraryEntryUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Update an existing library entry.

    Receives a LibraryEntryUpdate request body from the frontend.
    user_id comes from the JWT token, not from the frontend request body.
    The JWT user_id and request book_id are used together to find the correct library entry.
    status and rating are optional, so the frontend can update one or both fields.

    The actual update logic is handled by update_library()
    in the library service layer.

    Raises:
        HTTPException 404: If the library entry is not found or cannot be updated.

    Returns:
        The updated library entry.
    """

    result = update_library(
        user_id = user_id,
        book_id = entry.book_id,
        status = entry.status,
        rating = entry.rating
    )
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result["data"]


@router.delete("/{book_id}")
def remove_entry(book_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Remove a book from the authenticated user's library.

    Gets user_id from the JWT token.
    Receives book_id from the URL path.
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

