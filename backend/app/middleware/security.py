import time
import uuid
import structlog
from collections import defaultdict
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

logger = structlog.get_logger()


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
        
        # 3. Legacy XSS filter enforcement
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 4. Strict referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 5. Restrict iframe framing
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none';"
        
        # 6. HSTS (Strict-Transport-Security)
        if settings.is_production or request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        # 7. Remove server banner leakage
        if "server" in response.headers:
            del response.headers["server"]
            
        return response


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Injects and tracks a unique correlation ID per request for secure audit logging.
    """
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        
        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class SlidingWindowRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Thread-safe sliding-window rate limiter per client IP address.
    Protects auth, subscription, and data-deletion endpoints against brute force and abuse.
    """
    def __init__(self, app):
        super().__init__(app)
        # IP -> list of timestamps
        self.request_history: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "127.0.0.1"

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
        history = self.request_history[key]

        # Prune timestamps older than 60s
        cutoff = now - window
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
