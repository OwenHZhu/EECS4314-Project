from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # needed for connecting to React App Later

# 1. Book Service
from book_service.routers import books

# 2. Auth Service 
from auth_service.routers import register, login, account

# 3. Library Service 
from library_service.routers import lib 

# 4. Utils
from shared.constants import ORIGINS

app = FastAPI(title="BookAtlas API", description="Backend for BookAtlas reading platform", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

# Include Auth Routes
app.include_router(register.router, prefix="/api/v1")
app.include_router(login.router, prefix="/api/v1")
app.include_router(account.router, prefix="/api/v1")

# Include Book Routes
app.include_router(books.router, prefix="/api/v1/books", tags=["Books"])

# Include Library Routes
app.include_router(lib.router, prefix="/api/v1")