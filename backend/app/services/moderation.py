import logging
import re
from app.models.source import SourceType
from app.models.article import ArticleStatus

logger = logging.getLogger(__name__)

SPAM_KEYWORDS = {
    "free money", "make money fast", "subscribe now for cash", "buy now cheap",
    "limited time offer cash", "you have been selected to win", "claim your prize", "earn extra cash",
}

PROFANITY_LIST = {"damn", "bastard", "shit", "fuck"}

COMMERCIAL_PATTERNS = [
    r"\b(we think these|our expert thinks|we tested the|in our test|tested and reviewed|hands-on review|buyer'?s guide|buying guide|gift guide|gift ideas?|shopping guide|best deals?|deal alert|save \$\d+|\$\d+ off|deal of the day|lowest price|price drop)\b",
    r"\b(binoculars?|monoculars?|tripod|tripods|telescope deals?|celestron telescope|eyepieces?|camera lenses?|nikon binoculars?|best telescopes? for|best binoculars? for|portable celestron)\b",
    r"\b(board games?|card games?|cards against humanity|tabletop game|lego set|lego sets|lego star wars|lego nasa|lego space|action figure|action figures|merch|merchandise|apparel|space suit costume|mattel|funko pop|diecast)\b",
    r"\b(prime day|black friday|cyber monday|coupon code|promo code|discount code|on sale for|now only \$\d+|massive discount|best price on)\b",
    r"\b(where to stream|where to watch|streaming guide|movie review|tv review|season \d+ recap|episode \d+ review|trailer breakdown|box office)\b",
    r"\b(sponsored post|advertisement|promoted content|affiliate commission|partner content|commercial partner|paid feature|advertorial)\b",
]


def contains_spam(text: str) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in SPAM_KEYWORDS)


def contains_profanity(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in PROFANITY_LIST)


def is_commercial_or_advertorial(title: str, content: str, url: str = "") -> bool:
    combined = f"{title} {content} {url}".lower()
    for pattern in COMMERCIAL_PATTERNS:
        if re.search(pattern, combined, re.IGNORECASE):
            return True
    if any(p in url.lower() for p in ["/deals/", "/reviews/", "/buying-guides/", "/gift-guides/", "/entertainment/", "/coupon"]):
        return True
    return False


def moderate_article(article: dict, source_type: SourceType = SourceType.RSS) -> tuple[ArticleStatus, str]:
    title = article.get("title", "")
    content = article.get("content") or article.get("summary", "")
    url = article.get("url", "")
    text = f"{title} {content}".strip()

    if not text:
        return ArticleStatus.PENDING, "Empty content"

    if contains_profanity(text):
        return ArticleStatus.REJECTED, "Contains profanity"

    if contains_spam(text):
        return ArticleStatus.PENDING, "Possible spam content"

    if is_commercial_or_advertorial(title, content, url):
        return ArticleStatus.REJECTED, "Rejected commercial advertorial / affiliate product review"

    # Auto-approve all authentic astronomy & space research
    return ArticleStatus.APPROVED, "Auto-approved from trusted science feed"
