"""Audit log model."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class AuditLog(Base):
    """Audit log for all data changes."""
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), index=True)
    action = Column(String(50), nullable=False, index=True)  # create, update, delete, etc.
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    
    # Changes
    diff_json = Column(JSON)  # Before/after diff
    metadata = Column(JSON)  # Additional context
    
    # Request tracking
    request_id = Column(String(100), index=True)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    actor = relationship("User")
    
    # Composite indexes
    __table_args__ = (
        Index('ix_audit_entity', 'entity_type', 'entity_id'),
    )

