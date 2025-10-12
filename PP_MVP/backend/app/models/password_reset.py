from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from datetime import datetime, timedelta, timezone
from app.db.base import Base


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def is_valid(self):
        """Check if token is still valid (not used and not expired)"""
        return not self.used and datetime.now(timezone.utc) < self.expires_at

