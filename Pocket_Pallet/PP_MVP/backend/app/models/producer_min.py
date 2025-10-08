"""Minimal producer model for recommendations."""
from sqlalchemy import Column, BigInteger, Text, DateTime, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from enum import Enum

from app.db.session import Base


class ProducerClass(str, Enum):
    """Producer classification for ethos scoring."""
    GROWER_PRODUCER = "Grower-Producer"
    INDEPENDENT = "Independent"
    COOPERATIVE = "Cooperative"
    NEGOCIANT = "Negociant"
    INDUSTRIAL = "Industrial"


class ProducerMin(Base):
    """Minimal producer table for recommendation scoring."""
    __tablename__ = "producers_min"
    
    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    class_ = Column('class', SQLEnum(ProducerClass), nullable=False, default=ProducerClass.INDEPENDENT)
    flags = Column(ARRAY(Text), nullable=False, server_default='{}')
    summary = Column(Text)  # Optional 1-liner for tooltips
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('ix_producers_min_class', 'class'),
        Index('ix_producers_min_flags', 'flags', postgresql_using='gin'),
    )

