from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from typing import Optional, List, Any
from app.models.article import ArticleStatus, VerificationStatus


class ArticleBase(BaseModel):
    title: str
    content: Optional[str] = None
    summary: Optional[str] = None
    url: HttpUrl = Field(serialization_alias='url')
    source_url: Optional[HttpUrl] = Field(None, serialization_alias='sourceUrl')
    image_url: Optional[str] = Field(None, serialization_alias='imageUrl')
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    country: Optional[str] = None
    agency: Optional[str] = None
    is_published: bool = Field(True, serialization_alias='isPublished')


class ArticleCreate(ArticleBase):
    source_id: Optional[int] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    editorial_status: Optional[ArticleStatus] = None
    editorial_notes: Optional[str] = None
    is_verified: Optional[bool] = None
    verification_status: Optional[VerificationStatus] = None


class ArticleResponse(ArticleBase):
    id: int = Field(serialization_alias='id')
    source_id: Optional[int] = Field(None, serialization_alias='sourceId')
    published_at: Optional[datetime] = Field(None, serialization_alias='publishedAt')
    fetched_at: datetime = Field(serialization_alias='fetchedAt')
    is_verified: bool = Field(serialization_alias='isVerified')
    verification_status: VerificationStatus = Field(serialization_alias='verificationStatus')
    editorial_status: ArticleStatus = Field(serialization_alias='editorialStatus')
    editorial_notes: Optional[str] = Field(None, serialization_alias='editorialNotes')
    created_at: datetime = Field(serialization_alias='createdAt')
    updated_at: datetime = Field(serialization_alias='updatedAt')

    model_config = {"from_attributes": True}


class ArticleListResponse(BaseModel):
    items: List[ArticleResponse]
    total: int
    page: int
    size: int
