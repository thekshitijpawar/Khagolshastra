from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List, Any
from app.models.source import SourceType


class SourceBase(BaseModel):
    name: str
    type: SourceType
    url: HttpUrl
    feed_url: Optional[HttpUrl] = None
    country: Optional[str] = None
    category: Optional[List[str]] = None


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[SourceType] = None
    url: Optional[HttpUrl] = None
    feed_url: Optional[HttpUrl] = None
    country: Optional[str] = None
    category: Optional[List[str]] = None
    is_active: Optional[bool] = None


class SourceResponse(SourceBase):
    id: int
    is_active: bool
    last_fetched_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
