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
    result = add_or_update_library_entry(entry)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.get("/{user_id}")
def get_library(user_id: str):
    result = get_user_library(user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return result["data"]


@router.patch("/update")
def update_entry(entry: LibraryEntryUpdate):
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
    result = remove_library_entry(user_id, book_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])

    return result["data"]

