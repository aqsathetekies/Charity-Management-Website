from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.connection import engine, Base
from routes import auth, donations, expenses, dashboard, locations
import os

# Create tables in the database

Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="Charity Funding Management System API",
    description="Backend API for managing charity donations and expenses with transparency.",
    version="1.0.0"
)


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for screenshots so they can be viewed
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(donations.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(locations.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Charity Funding Management System API!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
