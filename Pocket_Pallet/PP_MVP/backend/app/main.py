"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import auth, wines, imports, review_queue, producers

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["auth"]
)

app.include_router(
    producers.router,
    prefix=f"{settings.API_V1_STR}/producers",
    tags=["producers"]
)

app.include_router(
    wines.router,
    prefix=f"{settings.API_V1_STR}/wines",
    tags=["wines"]
)

app.include_router(
    imports.router,
    prefix=f"{settings.API_V1_STR}/imports",
    tags=["imports"]
)

app.include_router(
    review_queue.router,
    prefix=f"{settings.API_V1_STR}/review-queue",
    tags=["review-queue"]
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

