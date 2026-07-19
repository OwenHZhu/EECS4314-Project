import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from library_service.routers.lib import router as library_router
from shared.constants import ORIGINS

app = FastAPI(
    title="BookAtlas Library Service",
    description="Handles user library, reading status, favourites, wishlist, and ratings.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(library_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "library_service"}

if __name__ == "__main__":
    uvicorn.run(
        "library_service.library_service:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
    )