from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.database import get_db
from app.models.article import Article
from app.schemas.article import ArticleListResponse

router = APIRouter()


@router.get("/articles", response_model=ArticleListResponse)
def list_articles(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=500),
    category: str | None = None,
    source_id: int | None = None,
    query: str | None = None,
    db: Session = Depends(get_db),
):
    db_query = db.query(Article).filter(Article.is_published == True)
    if source_id:
        db_query = db_query.filter(Article.source_id == source_id)
    if query:
        search = f"%{query}%"
        db_query = db_query.filter(
            or_(
                Article.title.ilike(search),
                Article.summary.ilike(search),
                Article.content.ilike(search),
            )
        )

    all_items = db_query.order_by(desc(Article.published_at)).all()
    if category and category.lower() != "all":
        cat_lower = category.lower()
        filtered = []
        for article in all_items:
            cats = [c.lower() for c in (article.categories or [])]
            tags = [t.lower() for t in (article.tags or [])]
            if cat_lower in cats or cat_lower in tags or cat_lower in article.title.lower():
                filtered.append(article)
        all_items = filtered

    total = len(all_items)
    start = (page - 1) * size
    items = all_items[start : start + size]

    # Sanitize any null or placeholder strings
    for item in items:
        if not item.summary or item.summary.strip() in ['null', 'None', '']:
            item.summary = f"Observatory dispatch and analysis on {item.title}."
        if not item.content or item.content.strip() in ['null', 'None', '']:
            item.content = item.summary
        if not item.image_url or item.image_url.strip() in ['null', 'None', '']:
            item.image_url = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80"

    return ArticleListResponse(items=items, total=total, page=page, size=size)


@router.get("/articles/{article_id}")
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if not article.summary or article.summary.strip() in ['null', 'None', '']:
        article.summary = f"Observatory dispatch and analysis on {article.title}."
    if not article.content or article.content.strip() in ['null', 'None', '']:
        article.content = article.summary
    return article
