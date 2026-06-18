from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # needed for connecting to React App Later

from routers import auth
from utils.constants import ORIGINS

app = FastAPI(title="BookAtlas API", description="Backend for BookAtlas reading platform", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(auth.router, prefix="/api/v1")