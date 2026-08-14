import logging
from datetime import datetime
from difflib import SequenceMatcher
from typing import Optional
from app.models.article import Article

logger = logging.getLogger(__name__)


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def find_duplicates(candidate: dict, existing_articles: list[Article]) -> tuple[Optional[Article], list[Article]]:
    canonical = None
    duplicates = []

    for article in existing_articles:
        title_sim = similarity(candidate.get("title", ""), article.title)
        url_sim = similarity(candidate.get("url", ""), article.url)

        if url_sim > 0.9 or title_sim > 0.85:
            if canonical is None:
                candidate_published = candidate.get("published_at") or datetime.utcnow()
                if candidate_published < article.published_at:
                    canonical = article
                    duplicates.append(article)
                else:
                    canonical = article
            else:
                duplicates.append(article)

    return canonical, duplicates


def deduplicate_batch(articles: list[dict], existing_articles: list[Article]) -> tuple[list[dict], list[dict]]:
    canonical_articles = []
    duplicate_articles = []

    seen_urls = {a.url for a in existing_articles}

    for article in articles:
        if article.get("url") in seen_urls:
            duplicate_articles.append(article)
            continue

        canonical, dups = find_duplicates(article, existing_articles)
        if canonical:
            duplicate_articles.append(article)
        else:
            canonical_articles.append(article)
            seen_urls.add(article.get("url", ""))

    return canonical_articles, duplicate_articles
