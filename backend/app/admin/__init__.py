import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.config import settings
from app.models.article import Article, ArticleStatus
from app.models.source import Source
from app.schemas.article import ArticleUpdate

router = APIRouter()


def verify_admin(
    authorization: Optional[str] = Header(None),
    x_admin_key: Optional[str] = Header(None),
):
    """
    Constant-time authentication verification for admin routes.
    """
    expected_key = settings.SECRET_KEY
    # Allow development bypass only when default dev key is active
    if expected_key == "dev-secret-key-change-in-production":
        return True

    provided = x_admin_key or (authorization.replace("Bearer ", "").strip() if authorization else "")
    if not provided or not secrets.compare_digest(provided, expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    total_articles = db.query(func.count(Article.id)).scalar()
    total_sources = db.query(func.count(Source.id)).scalar()
    pending = db.query(func.count(Article.id)).filter(Article.editorial_status == ArticleStatus.PENDING).scalar()
    approved = db.query(func.count(Article.id)).filter(Article.editorial_status == ArticleStatus.APPROVED).scalar()
    rejected = db.query(func.count(Article.id)).filter(Article.editorial_status == ArticleStatus.REJECTED).scalar()
    return {
        "total_articles": total_articles or 0,
        "total_sources": total_sources or 0,
        "pending": pending or 0,
        "approved": approved or 0,
        "rejected": rejected or 0,
    }


@router.get("/queue")
def get_editorial_queue(db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    items = db.query(Article).filter(Article.editorial_status == ArticleStatus.PENDING).order_by(func.random()).limit(50).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "summary": a.summary,
            "url": a.url,
            "source_url": a.source_url,
            "published_at": a.published_at.isoformat() if a.published_at else None,
            "categories": a.categories or [],
            "image_url": a.image_url,
            "editorial_status": a.editorial_status.value if hasattr(a.editorial_status, "value") else str(a.editorial_status),
        }
        for a in items
    ]


@router.post("/articles/{article_id}/approve")
def approve_article(article_id: int, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.editorial_status = ArticleStatus.APPROVED
    article.is_published = True
    db.commit()
    db.refresh(article)
    return {"id": article.id, "status": "approved", "title": article.title}


@router.post("/articles/{article_id}/reject")
def reject_article(article_id: int, body: ArticleUpdate, db: Session = Depends(get_db), auth: bool = Depends(verify_admin)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.editorial_status = ArticleStatus.REJECTED
    article.editorial_notes = body.editorial_notes
    db.commit()
    db.refresh(article)
    return {"id": article.id, "status": "rejected", "title": article.title}
