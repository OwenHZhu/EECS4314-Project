from fastapi import FastAPI
from analytics_service.routers.analytics_router import router

app = FastAPI(title="Analytics Service")
app.include_router(router)