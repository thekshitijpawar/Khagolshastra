from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional

from app.database import get_db
from app.models.research_paper import ResearchPaper
from app.services.research_client import search_research

router = APIRouter()


@router.get("/research/sources")
def get_research_sources(db: Session = Depends(get_db)):
    sources_info = [
        {
            "key": "aanda",
            "name": "Astronomy & Astrophysics (A&A)",
            "url": "https://www.aanda.org/",
            "description": "Premier European peer-reviewed astrophysics journal published by EDP Sciences.",
            "badge": "Peer-Reviewed Journal",
        },
        {
            "key": "iaarj",
            "name": "International Academic Astronomy Research Journal (IAARJ)",
            "url": "https://journaliaarj.com/index.php/IAARJ",
            "description": "Open-access research journal covering observational astrophysics and planetary dynamics.",
            "badge": "Open-Access Journal",
        },
        {
            "key": "arxiv",
            "name": "arXiv Astrophysics (astro-ph)",
            "url": "https://arxiv.org/archive/astro-ph",
            "description": "Cornell University preprint archive for solar, planetary, galactic, and cosmological research.",
            "badge": "Preprint Archive",
        },
        {
            "key": "nasa_ads",
            "name": "NASA ADS (Astrophysics Data System)",
            "url": "https://ui.adsabs.harvard.edu/",
            "description": "Harvard-Smithsonian NASA digital library portal with authoritative citation indices.",
            "badge": "Digital Library & ADS",
        },
    ]

    for s in sources_info:
        count = db.query(ResearchPaper).filter(ResearchPaper.source_key == s["key"]).count()
        s["paper_count"] = count

    total_count = db.query(ResearchPaper).count()
    return {"sources": sources_info, "total_papers": total_count}


@router.get("/research/papers")
def get_research_papers(
    source: Optional[str] = Query(None, description="Filter by source_key: aanda, iaarj, arxiv, nasa_ads"),
    category: Optional[str] = Query(None, description="Filter by category"),
    query: Optional[str] = Query(None, description="Search term across title, abstract, authors"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(ResearchPaper)

    if source and source.lower() != "all":
        q = q.filter(ResearchPaper.source_key == source.lower())

    if category and category.lower() != "all":
        q = q.filter(ResearchPaper.category.ilike(f"%{category}%"))

    if query and query.strip():
        term = f"%{query.strip()}%"
        q = q.filter(
            or_(
                ResearchPaper.title.ilike(term),
                ResearchPaper.abstract.ilike(term),
                ResearchPaper.doi.ilike(term),
                ResearchPaper.bibcode.ilike(term),
                ResearchPaper.journal_name.ilike(term),
            )
        )

    total = q.count()
    items = q.order_by(desc(ResearchPaper.id)).offset((page - 1) * size).limit(size).all()

    return {
        "items": [
            {
                "id": p.id,
                "title": p.title,
                "abstract": p.abstract or "",
                "authors": p.authors or [],
                "journal_name": p.journal_name,
                "source_key": p.source_key,
                "doi": p.doi or "",
                "arxiv_id": p.arxiv_id or "",
                "bibcode": p.bibcode or "",
                "url": p.url,
                "pdf_url": p.pdf_url or "",
                "published_date": p.published_date or "",
                "category": p.category or "Astrophysics",
                "citation_count": p.citation_count,
            }
            for p in items
        ],
        "total": total,
        "page": page,
        "size": size,
        "total_pages": (total + size - 1) // size if total > 0 else 1,
    }


@router.post("/research/search")
async def research_search(
    query: str = Query(..., min_length=1, max_length=200),
    max_results: int = Query(10, ge=1, le=50),
):
    clean_query = query.strip()
    if not clean_query:
        raise HTTPException(status_code=400, detail="Query is required")
    results = await search_research(clean_query, max_results=max_results)
    return {"query": clean_query, "results": results}
