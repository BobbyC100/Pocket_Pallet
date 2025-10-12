from sqlalchemy import Column, String, Float, Text, Integer
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.db.base import Base


class Wine(Base):
    __tablename__ = "wines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    price_usd = Column(Float, nullable=True)
    url = Column(String, nullable=True)
    region = Column(String, nullable=True, index=True)
    grapes = Column(String, nullable=True)
    vintage = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

