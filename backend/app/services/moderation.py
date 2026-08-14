import logging
from app.models.source import SourceType
from app.models.article import ArticleStatus

logger = logging.getLogger(__name__)

SPAM_KEYWORDS = {
    "free money", "make money fast", "subscribe now for cash", "buy now cheap",
    "limited time offer cash", "you have been selected to win", "claim your prize", "earn extra cash",
}

PROFANITY_LIST = {"damn", "bastard", "shit", "fuck"}


def contains_spam(text: str) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in SPAM_KEYWORDS)


def contains_profanity(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in PROFANITY_LIST)


def moderate_article(article: dict, source_type: SourceType = SourceType.RSS) -> tuple[ArticleStatus, str]:
    title = article.get("title", "")
    content = article.get("content") or article.get("summary", "")
    text = f"{title} {content}".strip()

    if not text:
        return ArticleStatus.PENDING, "Empty content"

    if contains_profanity(text):
        return ArticleStatus.REJECTED, "Contains profanity"

    if contains_spam(text):
        return ArticleStatus.PENDING, "Possible spam content"

    # Auto-approve all trusted astronomy feeds
    return ArticleStatus.APPROVED, "Auto-approved from trusted science feed"
