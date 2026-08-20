import re
import structlog
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.subscriber import Subscriber

logger = structlog.get_logger()
router = APIRouter()

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class EmailPayload(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email address format")
        return clean


def mask_email(email: str) -> str:
    """Mask email for privacy-safe logging: j***@domain.com"""
    try:
        parts = email.split("@")
        if len(parts) == 2:
            user, domain = parts
            masked_user = user[0] + "***" if len(user) > 0 else "***"
            return f"{masked_user}@{domain}"
    except Exception:
        pass
    return "[REDACTED_EMAIL]"


@router.post("/newsletter/subscribe")
def subscribe_newsletter(payload: EmailPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    masked = mask_email(clean_email)

    existing = db.query(Subscriber).filter(Subscriber.email == clean_email).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            existing.unsubscribed_at = None
            db.commit()
            logger.info("Subscriber reactivated", email=masked)
    else:
        new_sub = Subscriber(
            email=clean_email,
            is_active=True,
            subscribed_at=datetime.now(timezone.utc),
        )
        db.add(new_sub)
        db.commit()
        logger.info("New subscriber enrolled", email=masked)

    # Privacy-Preserving Uniform Response: Eliminates subscriber enumeration oracle
    return {
        "status": "success",
        "message": "Thank you. Your subscription preferences have been updated for Khagolshastra Cosmic Intelligence.",
        "email_masked": masked,
    }


@router.post("/newsletter/unsubscribe")
def unsubscribe_newsletter(payload: EmailPayload, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    masked = mask_email(clean_email)

    sub = db.query(Subscriber).filter(Subscriber.email == clean_email).first()
    if sub and sub.is_active:
        sub.is_active = False
        sub.unsubscribed_at = datetime.now(timezone.utc)
        db.commit()
        logger.info("Subscriber opted out", email=masked)

    # Privacy-Preserving Uniform Response
    return {
        "status": "success",
        "message": "If this email address was subscribed, it has been successfully unsubscribed.",
        "email_masked": masked,
    }


@router.post("/privacy/delete-data")
def delete_personal_data(payload: EmailPayload, db: Session = Depends(get_db)):
    """
    GDPR Article 17 / CCPA Right to Erasure
    Executes erasure and outputs uniform, privacy-preserving confirmation.
    """
    clean_email = payload.email.lower().strip()
    masked = mask_email(clean_email)

    sub = db.query(Subscriber).filter(Subscriber.email == clean_email).first()
    if sub:
        db.delete(sub)
        db.commit()
        logger.info("GDPR Right to Erasure executed: Data permanently purged", email=masked)

    # Privacy-Preserving Uniform Response: Eliminates account enumeration oracle
    return {
        "status": "success",
        "message": "If this email address is on file, your erasure request has been processed and all associated records permanently purged.",
        "email_masked": masked,
    }


@router.get("/privacy/summary")
def get_privacy_summary():
    """
    Transparent data movement summary
    """
    return {
        "app_name": "Khagolshastra Journal",
        "data_collected": [
            {
                "type": "Email Address",
                "purpose": "Daily dawn astronomy dispatch delivery",
                "collection_point": "Homepage Subscription Form",
                "storage_location": "Local SQLite database (encrypted volume in prod)",
                "third_party_sharing": "None. Zero user PII transmitted to external vendors.",
                "retention_period": "Until user requests unsubscribe or erasure via /api/privacy/delete-data",
            }
        ],
        "tracking_cookies": "None. Zero advertising or third-party behavioral tracking cookies.",
        "gdpr_rights": {
            "right_to_access": "True",
            "right_to_erasure": "Available via POST /api/privacy/delete-data",
            "opt_out": "Available via POST /api/newsletter/unsubscribe",
        }
    }
