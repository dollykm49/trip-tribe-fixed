from fastapi import FastAPI
from app.routes import router as api_router

app = FastAPI()

# Include the API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Trip Plan App API!"}