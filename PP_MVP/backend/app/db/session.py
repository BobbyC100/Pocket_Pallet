from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create synchronous engine for migrations
engine = create_engine(
    settings.DATABASE_URL_SYNC or settings.DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://'),
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

