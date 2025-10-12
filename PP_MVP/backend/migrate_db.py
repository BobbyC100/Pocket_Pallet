"""
Database migration script to fix users table schema
Run this once to update the database schema
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.base import Base
from app.models.user import User  # Import to register the model

# Create engine
engine = create_engine(
    settings.DATABASE_URL_SYNC or settings.DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://'),
    pool_pre_ping=True,
)

def migrate():
    """Drop and recreate users table"""
    with engine.begin() as conn:
        # Drop the table
        print("Dropping users table...")
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        print("Users table dropped.")
    
    # Create all tables
    print("Creating tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    print("\nMigration complete. You can now create users with username field.")

if __name__ == "__main__":
    migrate()

