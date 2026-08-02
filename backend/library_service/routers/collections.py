from fastapi import APIRouter, Depends, HTTPException

from auth_service.utils.jwt import get_current_user_id
from library_service.schemas.collection import CollectionCreate, CollectionUpdate
from library_service.services.collection_service import (
    add_book_to_collection,
    create_collection,
    delete_collection,
    get_collection,
    get_user_collections,
    remove_book_from_collection,
    update_collection
)


router = APIRouter(prefix="/collections", tags=["Collections"])


@router.post("")
def create_new_collection(collection: CollectionCreate, user_id: str = Depends(get_current_user_id)):
    """
    Create a custom collection for the authenticated user.

    The collection name and optional description come from the request body.
    The user ID comes from the JWT token and is not accepted from the frontend.

    Raises:
        HTTPException 400: If the collection cannot be created.

    Returns:
        The newly created collection.
    """
    result = create_collection(collection, user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.get("")
def get_collections(user_id: str = Depends(get_current_user_id)):
    """
    Get all collections owned by the authenticated user.

    Returns:
        A list of the user's collections ordered by their last update time.
    """
    result = get_user_collections(user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.get("/{collection_id}")
def get_collection_by_id(collection_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Get one collection and its books.

    The authenticated user must own the requested collection.

    Raises:
        HTTPException 404: If the collection does not exist or does not belong
                           to the authenticated user.

    Returns:
        The collection with its associated book records.
    """
    result = get_collection(collection_id, user_id)

    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]


@router.patch("/{collection_id}")
def update_existing_collection(collection_id: str, collection: CollectionUpdate, user_id: str = Depends(get_current_user_id)):
    """
    Update the name or description of an existing collection.

    The authenticated user must own the requested collection.

    Raises:
        HTTPException 400: If no valid update fields are provided.
        HTTPException 404: If the collection is not found.

    Returns:
        The updated collection.
    """
    result = update_collection(collection_id, collection, user_id)

    if not result["success"]:
        status_code = 404 if result["message"] == "Collection not found" else 400
        raise HTTPException(status_code=status_code, detail=result["message"])

    return result["data"]


@router.delete("/{collection_id}")
def remove_collection(collection_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Delete a collection owned by the authenticated user.

    This does not remove books from the user's library or global catalogue.

    Raises:
        HTTPException 404: If the collection is not found.

    Returns:
        The deleted collection.
    """
    result = delete_collection(collection_id, user_id)

    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]


@router.post("/{collection_id}/books/{book_id}")
def add_collection_book(collection_id: str, book_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Add one of the authenticated user's library books to a collection.

    Raises:
        HTTPException 404: If the collection or library book is not found.
        HTTPException 409: If the book is already in the collection.

    Returns:
        The newly created collection_books record.
    """
    result = add_book_to_collection(collection_id, book_id, user_id)

    if not result["success"]:
        if result["message"] == "Book is already in this collection":
            status_code = 409
        else:
            status_code = 404
        raise HTTPException(status_code=status_code, detail=result["message"])

    return result["data"]


@router.delete("/{collection_id}/books/{book_id}")
def remove_collection_book(collection_id: str, book_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Remove a book from a collection owned by the authenticated user.

    This does not remove the book from the user's library or global catalogue.

    Raises:
        HTTPException 404: If the collection or collection book is not found.

    Returns:
        The deleted collection_books record.
    """
    result = remove_book_from_collection(collection_id, book_id, user_id)

    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]
