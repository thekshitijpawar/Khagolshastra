import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.source import Source, SourceType
from app.models.article import Article, ArticleStatus
from app.services.aggregator import fetch_source
from app.services.deduplicator import deduplicate_batch
from app.services.moderation import moderate_article
from app.services.source_registry import SOURCES
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task
def ingest_sources() -> dict:
    logger.info("Starting ingestion task")
    db: Session = SessionLocal()
    try:
        all_articles = []
        source_map = {s["id"]: s for s in SOURCES}
        db_sources = {s.name: s for s in db.query(Source).all()}
        for source_cfg in SOURCES:
            if source_cfg["name"] not in db_sources:
                db_source = Source(
                    name=source_cfg["name"],
                    type=source_cfg["type"],
                    url=source_cfg["url"],
                    feed_url=source_cfg.get("feed_url"),
                    country=source_cfg.get("country"),
                    category=source_cfg.get("category", []),
                )
                db.add(db_source)
                db_sources[source_cfg["name"]] = db_source
        db.commit()
        for source in SOURCES:
            try:
                batch = asyncio.run(fetch_source(source["id"]))
                all_articles.extend(batch)
                logger.info("Fetched %d articles from %s", len(batch), source["name"])
            except Exception as exc:
                logger.error("Failed to fetch from %s: %s", source["name"], exc)

        existing = db.query(Article).all()
        canonical, duplicates = deduplicate_batch(all_articles, existing)
        saved = 0
        for article in canonical:
            source_cfg = source_map.get(article.get("source_id"))
            source_type = SourceType(source_cfg["type"]) if source_cfg else SourceType.RSS
            source_name = source_cfg["name"] if source_cfg else None
            db_source = db_sources.get(source_name) if source_name else None
            if db_source:
                article["source_id"] = db_source.id
            else:
                article.pop("source_id", None)
            moderation_status, note = moderate_article(article, source_type)
            db_article = Article(
                title=article["title"],
                content=article.get("content"),
                summary=article.get("summary"),
                url=article["url"],
                source_id=article.get("source_id"),
                source_url=article.get("source_url"),
                published_at=article.get("published_at"),
                fetched_at=article.get("fetched_at", datetime.now(timezone.utc)),
                categories=article.get("categories", []),
                tags=article.get("tags", []),
                country=article.get("country"),
                agency=article.get("agency"),
                image_url=article.get("image_url"),
                editorial_status=moderation_status,
                editorial_notes=note,
            )
            db.add(db_article)
            saved += 1
        db.commit()
        logger.info("Saved %d articles", saved)
        return {"status": "completed", "articles_processed": len(all_articles)}
    except Exception as exc:
        db.rollback()
        logger.error("Ingestion task failed: %s", exc)
        return {"status": "failed", "error": str(exc)}
    finally:
        db.close()
