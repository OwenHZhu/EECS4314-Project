from fastapi import APIRouter, HTTPException
from analytics_service.services.analytics_service import get_popular_searches, get_popular_books

router = APIRouter(prefix="/api/v1/analytics")

@router.get("/popular-searches")
def popular_searches_route(limit: int = 5):
    result = get_popular_searches(limit=limit)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"data": result["data"]}

@router.get("/popular-books")
def popular_books_route(limit: int = 5):
    result = get_popular_books(limit=limit)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    return {"data": result["data"]}