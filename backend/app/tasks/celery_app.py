from celery import Celery
from app.config import settings

celery_app = Celery(
    "khagolshastra",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingestion"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "ingest-sources-every-30-minutes": {
            "task": "app.tasks.ingestion.ingest_sources",
            "schedule": settings.INGESTION_INTERVAL_MINUTES * 60.0,
        },
    },
)
