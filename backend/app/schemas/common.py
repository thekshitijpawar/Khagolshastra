from pydantic import BaseModel
from typing import Optional


class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str
    database: str
    redis: str
