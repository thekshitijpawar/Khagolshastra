import uuid
import structlog
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import articles, research, sources, categories, observatory, podcast, privacy
from app.admin import router as admin_router
from app.middleware.security import (
    EnterpriseSecurityHeadersMiddleware,
    CorrelationIdMiddleware,
    SlidingWindowRateLimiterMiddleware,
)

logger = structlog.get_logger()

# Ensure all database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Khagolshastra API",
    description="International Journal of Astronomy & Spaceflight API",
    version="0.1.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# 1. Mount Security Middleware Stack (Order matters: Outer to Inner)
app.add_middleware(EnterpriseSecurityHeadersMiddleware)
app.add_middleware(SlidingWindowRateLimiterMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# 2. CORS Middleware with domain validation
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

# 3. Mount Routers
app.include_router(articles.router, prefix="/api", tags=["articles"])
app.include_router(observatory.router, prefix="/api", tags=["observatory"])
app.include_router(podcast.router, prefix="/api", tags=["podcast"])
app.include_router(research.router, prefix="/api", tags=["research"])
app.include_router(sources.router, prefix="/api", tags=["sources"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(privacy.router, prefix="/api", tags=["privacy"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Security-Hardened Global Exception Handler:
    Logs sanitized details internally with correlation ID and outputs zero stack traces or internal paths to client.
    """
    correlation_id = getattr(request.state, "correlation_id", str(uuid.uuid4()))
    logger.error(
        "Internal server exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        correlation_id=correlation_id,
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred. Please reference the correlation ID when contacting support.",
            "correlation_id": correlation_id,
        },
        headers={"X-Correlation-ID": correlation_id},
    )


@app.get("/health", response_model=dict)
def health_check():
    return {"status": "healthy"}


@app.get("/", include_in_schema=False)
def root():
    return JSONResponse({
        "name": "Khagolshastra API",
        "version": "0.1.0",
        "health": "/health",
        "endpoints": {
            "articles": "/api/articles",
            "observatory": "/api/observatory/webb",
            "research": "/api/research/papers",
            "podcast": "/api/podcast/current",
            "privacy": "/api/privacy/summary",
            "sources": "/api/sources",
            "categories": "/api/categories",
            "admin": "/api/admin",
        }
    })
