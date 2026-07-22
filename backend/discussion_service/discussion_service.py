import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from discussion_service.routers.forum import router as forum_router
from shared.constants import ORIGINS

app = FastAPI(
    title="BookAtlas Discussion Service",
    description="Handles discussion threads, replies, likes, and user activity.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forum_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "discussion_service"}


if __name__ == "__main__":
    uvicorn.run(
        "discussion_service.discussion_service:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
    )