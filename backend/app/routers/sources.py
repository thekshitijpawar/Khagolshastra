from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.source import Source
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse
from app.admin import verify_admin

router = APIRouter()


@router.get("/sources", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    """Public read-only syndication sources catalog"""
    return db.query(Source).all()


@router.post("/sources", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
def create_source(
    source: SourceCreate,
    db: Session = Depends(get_db),
    auth: bool = Depends(verify_admin),
):
    """Admin-only: Create a new syndication source feed"""
    existing = db.query(Source).filter(Source.name == source.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Source already exists")
    db_source = Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


@router.patch("/sources/{source_id}", response_model=SourceResponse)
def update_source(
    source_id: int,
    source: SourceUpdate,
    db: Session = Depends(get_db),
    auth: bool = Depends(verify_admin),
):
    """Admin-only: Update syndication source feed configuration"""
    db_source = db.query(Source).filter(Source.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    for key, value in source.model_dump(exclude_unset=True).items():
        setattr(db_source, key, value)
    db.commit()
    db.refresh(db_source)
    return db_source


@router.delete("/sources/{source_id}")
def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    auth: bool = Depends(verify_admin),
):
    """Admin-only: Delete syndication source feed"""
    db_source = db.query(Source).filter(Source.id == source_id).first()
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(db_source)
    db.commit()
    return {"detail": "Source successfully removed", "source_id": source_id}
