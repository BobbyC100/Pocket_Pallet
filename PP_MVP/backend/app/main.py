from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from app.core.config import settings
from app.api.endpoints import auth, imports, wines, ocr, tasting_notes, scraper, dedupe_admin
from app.db.base import Base
from app.db.session import engine

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Bulletproof CORS setup
# Read from env, support both JSON list and comma-separated strings
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000")
if origins_env.startswith("["):
    try:
        ALLOW_ORIGINS = json.loads(origins_env)
    except Exception:
        ALLOW_ORIGINS = ["http://localhost:3000"]
else:
    ALLOW_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

# Allow Vercel preview deployments via regex
ALLOW_ORIGIN_REGEX = r"https://pocket-pallet-.*\.vercel\.app"

# IMPORTANT: CORS middleware must be added BEFORE routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(imports.router, prefix=f"{settings.API_V1_STR}/imports", tags=["imports"])
app.include_router(wines.router, prefix=f"{settings.API_V1_STR}/wines", tags=["wines"])
app.include_router(ocr.router, prefix=f"{settings.API_V1_STR}/ocr", tags=["ocr"])
app.include_router(tasting_notes.router, prefix=f"{settings.API_V1_STR}/tasting-notes", tags=["tasting_notes"])
app.include_router(scraper.router, prefix=f"{settings.API_V1_STR}/scraper", tags=["scraper"])
app.include_router(dedupe_admin.router, prefix=f"{settings.API_V1_STR}/dedupe", tags=["dedupe"])


@app.get("/")
def root():
    return {
        "message": "Welcome to Pocket Pallet API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cors_origins": ALLOW_ORIGINS,
        "cors_regex": ALLOW_ORIGIN_REGEX,
        "frontend_url": settings.FRONTEND_URL,
        "api_base": settings.API_V1_STR,
    }

