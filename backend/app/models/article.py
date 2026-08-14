from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
from app.models.source import Source, SourceType


class ArticleStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class VerificationStatus(str, Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    DISPUTED = "disputed"


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    url = Column(String(1000), nullable=False, unique=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    source_url = Column(String(1000), nullable=True)
    published_at = Column(DateTime, nullable=True, index=True)
    fetched_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    categories = Column(JSON, nullable=True, default=list)
    tags = Column(JSON, nullable=True, default=list)
    country = Column(String(100), nullable=True)
    agency = Column(String(200), nullable=True)
    image_url = Column(String(1000), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    editorial_status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.PENDING, nullable=False)
    editorial_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc), nullable=False)

    source = relationship("Source", back_populates="articles")
