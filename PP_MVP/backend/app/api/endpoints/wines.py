from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.wine import Wine
from app.schemas.wine import WineResponse

router = APIRouter()


@router.get("", response_model=List[WineResponse])
def list_wines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Get a list of wines with pagination.
    """
    wines = db.query(Wine).offset(skip).limit(limit).all()
    return wines


@router.get("/count")
def count_wines(db: Session = Depends(get_db)):
    """
    Get total count of wines in database.
    """
    count = db.query(Wine).count()
    return {"count": count}


@router.get("/{wine_id}", response_model=WineResponse)
def get_wine(wine_id: int, db: Session = Depends(get_db)):
    """
    Get a specific wine by ID.
    """
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wine not found"
        )
    return wine

