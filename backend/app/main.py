from app.routes.scrape import router as scrape_router
from app.routes.search import router as search_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(
    title="RRL Finder API",
    description="Backend API for the RRL Finder application",
    version="1.0.0"
)

# Allow communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register search routes
app.include_router(search_router, prefix="/api")
app.include_router(scrape_router, prefix="/api")

# Homepage endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to RRL Finder API",
        "status": "success"
    }


# Backend health check
@app.get("/health")
def health_check():
    return {
        "status": "running",
        "application": "RRL Finder"
    }
