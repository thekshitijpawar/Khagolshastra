from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.article import Article

router = APIRouter()


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    articles = db.query(Article.categories).filter(Article.is_published == True).all()
    category_counts: dict[str, int] = {}
    for (cats,) in articles:
        if cats:
            for cat in cats:
                category_counts[cat] = category_counts.get(cat, 0) + 1
    result = [
        {"name": name, "slug": name.lower().replace(" ", "-"), "count": count}
        for name, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    ]
    return result
