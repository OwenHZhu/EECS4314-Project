from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # needed for connecting to React App Later

app = FastAPI(title="BookAtlas API", description="Backend for BookAtlas reading platform", version="1.0.0")

@app.get("/")
def root():
    return {"message": "BookAtlas API is running"}