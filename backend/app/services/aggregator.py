import logging
import re
import asyncio
import feedparser
import httpx
from datetime import datetime, timezone
from typing import Optional
from app.services.source_registry import SOURCES

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 KhagolshastraBot/1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

# High-resolution astronomy fallback images curated for space themes
FALLBACK_IMAGES = {
    "solar-system": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
    "exoplanets": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    "stars": "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80",
    "milky-way": "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=1200&q=80",
    "galaxies": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
    "exotic-objects": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "cosmology": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    "this-week-in-astronomy": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    "today-in-the-history-of-astronomy": "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80",
    "launches": "https://images.unsplash.com/photo-1517976487507-5989b651ff23?auto=format&fit=crop&w=1200&q=80",
    "human-spaceflight": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80",
    "robotic-spaceflight": "https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&w=1200&q=80",
    "news": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "default": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
}


class AggregatorError(Exception):
    pass


class FeedParsingError(AggregatorError):
    pass


class APIRequestError(AggregatorError):
    pass


def clean_html(raw_html: str) -> str:
    """Strips HTML tags and normalizes whitespace."""
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", " ", raw_html)
    clean = re.sub(r"&#8217;", "'", clean)
    clean = re.sub(r"&#8220;|&#8221;", '"', clean)
    clean = re.sub(r"&#8211;|&#8212;", "—", clean)
    clean = re.sub(r"&amp;", "&", clean)
    clean = re.sub(r"&nbsp;", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


async def fetch_rss_feed(feed_url: str, timeout: int = 15) -> feedparser.FeedParserDict:
    try:
        async with httpx.AsyncClient(timeout=timeout, headers=HEADERS) as client:
            response = await client.get(feed_url, follow_redirects=True)
            response.raise_for_status()
            parsed = feedparser.parse(response.content)
            if parsed.bozo and not parsed.entries:
                raise FeedParsingError(f"Failed to parse feed: {feed_url}")
            return parsed
    except httpx.HTTPError as exc:
        raise APIRequestError(f"HTTP error fetching {feed_url}: {exc}") from exc
    except Exception as exc:
        raise FeedParsingError(f"Unexpected error fetching {feed_url}: {exc}") from exc


async def extract_og_image(url: str, client: httpx.AsyncClient, timeout: float = 6.0) -> Optional[str]:
    """Scrapes og:image or twitter:image from an article URL."""
    try:
        res = await client.get(url, headers=HEADERS, follow_redirects=True, timeout=timeout)
        if res.status_code == 200:
            text = res.text
            m = re.search(r'<meta[^>]+property=[\'"]og:image[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', text, re.I)
            if not m:
                m = re.search(r'<meta[^>]+content=[\'"]([^\'"]+)[\'"][^>]+property=[\'"]og:image[\'"]', text, re.I)
            if not m:
                m = re.search(r'<meta[^>]+name=[\'"]twitter:image[\'"][^>]+content=[\'"]([^\'"]+)[\'"]', text, re.I)
            if m:
                img_url = m.group(1).strip()
                if img_url.startswith("http"):
                    return img_url
    except Exception:
        pass
    return None


def parse_rss_entry(
    entry: dict,
    source_id: str,
    source_name: str,
    source_url: str,
    categories: list | None = None,
    country: str | None = None
) -> dict:
    title = clean_html(entry.get("title", "").strip())
    link = entry.get("link", "").strip()
    if not title or not link:
        return {}

    content_raw = ""
    if hasattr(entry, "content") and entry.content:
        content_raw = entry.content[0].value
    elif hasattr(entry, "summary") and entry.summary:
        content_raw = entry.summary
    elif hasattr(entry, "description") and entry.description:
        content_raw = entry.description

    clean_content = clean_html(content_raw)
    summary = clean_content[:320] + ("..." if len(clean_content) > 320 else "")

    published = None
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
    elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
        published = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
    else:
        published = datetime.now(timezone.utc)

    tags = []
    if hasattr(entry, "tags") and entry.tags:
        tags = [clean_html(tag.term) for tag in entry.tags if hasattr(tag, "term") and tag.term]

    image_url = None
    if hasattr(entry, "media_content") and entry.media_content:
        for m in entry.media_content:
            if m.get("url"):
                image_url = m.get("url")
                break
    if not image_url and hasattr(entry, "enclosures") and entry.enclosures:
        for enc in entry.enclosures:
            if enc.get("type", "").startswith("image/") or "image" in enc.get("type", ""):
                image_url = enc.get("href")
                break
    if not image_url and content_raw:
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content_raw, re.I)
        if img_match:
            cand = img_match.group(1)
            if not cand.endswith(".gif") and "avatar" not in cand and "icon" not in cand:
                image_url = cand

    primary_cat = categories[0] if categories and len(categories) > 0 else "default"
    fallback_img = FALLBACK_IMAGES.get(primary_cat, FALLBACK_IMAGES["default"])

    return {
        "title": title,
        "content": clean_content,
        "summary": summary,
        "url": link,
        "source_id": source_id,
        "source_name": source_name,
        "source_url": source_url,
        "published_at": published,
        "fetched_at": datetime.now(timezone.utc),
        "tags": tags,
        "categories": categories or [],
        "country": country,
        "image_url": image_url or fallback_img,
        "_needs_og_fetch": image_url is None,
    }


async def fetch_source(source_id: str, fetch_og_images: bool = True) -> list[dict]:
    source = next((s for s in SOURCES if s["id"] == source_id), None)
    if not source:
        raise AggregatorError(f"Unknown source: {source_id}")

    if source["type"] == "rss":
        parsed = await fetch_rss_feed(source["feed_url"])
        articles = []
        for entry in parsed.entries[:20]:  # Up to 20 most recent entries per feed
            article = parse_rss_entry(
                entry,
                source_id,
                source["name"],
                source["url"],
                source.get("category", []),
                source.get("country"),
            )
            if article:
                articles.append(article)

        if fetch_og_images:
            # Concurrently scrape og:image for articles that lack direct feed images
            async with httpx.AsyncClient(timeout=8.0, headers=HEADERS) as client:
                async def enrich_image(art: dict):
                    if art.get("_needs_og_fetch"):
                        og = await extract_og_image(art["url"], client)
                        if og:
                            art["image_url"] = og
                    art.pop("_needs_og_fetch", None)

                await asyncio.gather(*(enrich_image(a) for a in articles), return_exceptions=True)

        return articles

    raise AggregatorError(f"Unsupported source type for {source_id}")


async def fetch_all_active_sources(fetch_og: bool = True) -> list[dict]:
    all_articles = []
    tasks = [fetch_source(source["id"], fetch_og_images=fetch_og) for source in SOURCES]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for source, res in zip(SOURCES, results):
        if isinstance(res, Exception):
            logger.error("Failed to fetch from %s: %s", source["name"], res)
        else:
            all_articles.extend(res)
            logger.info("Fetched %d articles from %s", len(res), source["name"])

    return all_articles
