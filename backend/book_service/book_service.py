from fastapi import FastAPI
from book_service.routers.books import router as books_router

app = FastAPI(title="Book Service API")

# Attach just the book routers to this specific app
app.include_router(books_router, prefix="/api/v1/books")