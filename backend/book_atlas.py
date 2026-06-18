from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # needed for connecting to React App Later

from routers import auth

app = FastAPI(title="BookAtlas API", description="Backend for BookAtlas reading platform", version="1.0.0")

app.include_router(auth.router, prefix="/api/v1")