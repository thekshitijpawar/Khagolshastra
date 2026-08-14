import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.source import Source, SourceType
from app.models.article import Article, ArticleStatus, VerificationStatus
from app.services.aggregator import fetch_source, fetch_all_active_sources
from app.services.deduplicator import deduplicate_batch
from app.services.moderation import moderate_article
from app.services.source_registry import SOURCES

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


async def run_full_ingestion():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        logger.info("Initializing sources in database...")
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
                db.commit()
                db.refresh(db_source)
                db_sources[source_cfg["name"]] = db_source

        logger.info("Fetching articles from %d sources...", len(SOURCES))
        all_articles = []
        for s in SOURCES:
            try:
                articles = await fetch_source(s["id"], fetch_og_images=True)
                all_articles.extend(articles)
                logger.info("-> Successfully fetched %d articles from %s", len(articles), s["name"])
            except Exception as e:
                logger.error("-> Failed fetching %s: %s", s["name"], e)

        logger.info("Total raw articles fetched: %d", len(all_articles))

        # Check existing articles to avoid duplicates
        existing = db.query(Article).all()
        existing_urls = {a.url for a in existing}

        saved_count = 0
        updated_count = 0

        source_map = {s["id"]: s for s in SOURCES}

        for article in all_articles:
            src_cfg = source_map.get(article.get("source_id"), {})
            src_name = src_cfg.get("name")
            db_source = db_sources.get(src_name)
            src_id = db_source.id if db_source else None

            if article["url"] in existing_urls:
                # Update existing article image if missing or status
                ex_art = db.query(Article).filter(Article.url == article["url"]).first()
                if ex_art:
                    if not ex_art.image_url and article.get("image_url"):
                        ex_art.image_url = article.get("image_url")
                    ex_art.is_published = True
                    ex_art.editorial_status = ArticleStatus.APPROVED
                    ex_art.categories = article.get("categories", ex_art.categories)
                    updated_count += 1
                continue

            db_article = Article(
                title=article["title"],
                content=article.get("content"),
                summary=article.get("summary"),
                url=article["url"],
                source_id=src_id,
                source_url=article.get("source_url"),
                published_at=article.get("published_at"),
                fetched_at=article.get("fetched_at", datetime.now(timezone.utc)),
                categories=article.get("categories", []),
                tags=article.get("tags", []),
                country=article.get("country"),
                agency=article.get("agency"),
                image_url=article.get("image_url"),
                is_verified=True,
                verification_status=VerificationStatus.VERIFIED,
                is_published=True,
                editorial_status=ArticleStatus.APPROVED,
                editorial_notes="Auto-ingested and approved from science feed",
            )
            db.add(db_article)
            existing_urls.add(article["url"])
            saved_count += 1

        # Also update any old pending/rejected articles in DB to approved
        db.query(Article).filter(Article.editorial_status != ArticleStatus.REJECTED).update({
            Article.is_published: True,
            Article.editorial_status: ArticleStatus.APPROVED
        })

        db.commit()
        logger.info("Ingestion completed! Added %d new articles, updated %d.", saved_count, updated_count)

        total_in_db = db.query(Article).filter(Article.is_published == True).count()
        logger.info("Total published articles in database: %d", total_in_db)

    except Exception as e:
        db.rollback()
        logger.error("Ingestion failed with error: %s", e, exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(run_full_ingestion())
