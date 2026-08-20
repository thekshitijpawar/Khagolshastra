import re
import time
import uuid
import structlog
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

logger = structlog.get_logger()
CORRELATION_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{8,64}$")


class EnterpriseSecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Applies enterprise-grade defense-in-depth HTTP headers to every response.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # 1. MIME sniffing prevention
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 2. Clickjacking prevention
        response.headers["X-Frame-Options"] = "DENY"
        
        # 3. Strict referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 4. Restrict iframe framing
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none';"
        
        # 5. HSTS (Strict-Transport-Security)
        if settings.is_production or request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        # 6. Remove server banner leakage
        if "server" in response.headers:
            del response.headers["server"]
            
        return response


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Injects and tracks a sanitized correlation ID per request for secure audit logging.
    Prevents header reflection & log injection.
    """
    async def dispatch(self, request: Request, call_next):
        provided = request.headers.get("X-Correlation-ID")
        if provided and CORRELATION_ID_REGEX.match(provided.strip()):
            correlation_id = provided.strip()
        else:
            correlation_id = str(uuid.uuid4())

        request.state.correlation_id = correlation_id
        
        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class SlidingWindowRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Thread-safe sliding-window rate limiter per validated client IP address.
    Protects auth, subscription, and data-deletion endpoints against brute force and abuse.
    Prevents memory exhaustion by pruning stale keys when store size exceeds bounds.
    """
    MAX_STORE_KEYS = 10000

    def __init__(self, app):
        super().__init__(app)
        # IP -> list of timestamps
        self.request_history: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        direct_ip = request.client.host if request.client else "127.0.0.1"
        # Only trust X-Forwarded-For if direct peer is in TRUSTED_PROXIES allowlist
        if direct_ip in settings.trusted_proxies_list or "*" in settings.trusted_proxies_list:
            forwarded = request.headers.get("X-Forwarded-For")
            if forwarded:
                return forwarded.split(",")[0].strip()
        return direct_ip

    def _cleanup_stale_keys(self, now: float, cutoff: float) -> None:
        """Prune stale IP entries to prevent unbounded memory growth."""
        if len(self.request_history) < self.MAX_STORE_KEYS:
            return
        keys_to_delete = [
            k for k, timestamps in self.request_history.items()
            if not timestamps or max(timestamps) <= cutoff
        ]
        for k in keys_to_delete:
            del self.request_history[k]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        now = time.time()
        client_ip = self._get_client_ip(request)

        # Determine rate limit threshold based on endpoint sensitivity
        is_sensitive = any(path.startswith(prefix) for prefix in [
            "/api/newsletter",
            "/api/privacy",
            "/api/admin",
        ])

        limit = settings.RATE_LIMIT_AUTH_PER_MINUTE if is_sensitive else settings.RATE_LIMIT_GENERAL_PER_MINUTE
        window = 60.0  # 60 seconds sliding window

        key = f"{client_ip}:{ 'sensitive' if is_sensitive else 'general' }"
        
        # Periodic memory cleanup if bounds exceeded
        cutoff = now - window
        self._cleanup_stale_keys(now, cutoff)

        history = self.request_history[key]
        history[:] = [ts for ts in history if ts > cutoff]

        if len(history) >= limit:
            logger.warning(
                "Rate limit exceeded",
                ip=client_ip,
                path=path,
                count=len(history),
                limit=limit,
                correlation_id=getattr(request.state, "correlation_id", "unknown")
            )
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Please slow down and try again shortly.",
                    "correlation_id": getattr(request.state, "correlation_id", str(uuid.uuid4())),
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                }
            )

        history.append(now)
        remaining = max(0, limit - len(history))

        response: Response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
