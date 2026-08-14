from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime, timezone
from app.database import Base


class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, nullable=True, default=list)
    journal_name = Column(String(200), nullable=False, index=True)
    source_key = Column(String(50), nullable=False, index=True)  # 'aanda', 'iaarj', 'arxiv', 'nasa_ads'
    doi = Column(String(200), nullable=True)
    arxiv_id = Column(String(100), nullable=True)
    bibcode = Column(String(100), nullable=True)
    url = Column(String(1000), nullable=False, unique=True, index=True)
    pdf_url = Column(String(1000), nullable=True)
    published_date = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True, index=True)
    citation_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
