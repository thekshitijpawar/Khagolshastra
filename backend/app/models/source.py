from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class SourceType(str, Enum):
    RSS = "rss"
    API = "api"
    SCRAPER = "scraper"


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    type = Column(String(20), nullable=False)
    url = Column(String(1000), nullable=False)
    feed_url = Column(String(1000), nullable=True)
    country = Column(String(100), nullable=True)
    category = Column(JSON, nullable=True, default=list)
    is_active = Column(Boolean, default=True, nullable=False)
    last_fetched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    articles = relationship("Article", back_populates="source", cascade="all, delete-orphan")
