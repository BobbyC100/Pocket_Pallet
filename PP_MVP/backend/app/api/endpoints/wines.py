from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.wine import Wine
from app.schemas.wine import WineResponse
from app.api.deps import get_current_user

router = APIRouter()


class WineStatusUpdate(BaseModel):
    """Schema for updating wine status"""
    status: Optional[str] = None  # "Tried", "Want to Try", "Cellar", None


class WineRatingUpdate(BaseModel):
    """Schema for updating wine rating"""
    rating: Optional[int] = None  # 1-5 stars


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
    return count


@router.get("/my", response_model=List[WineResponse])
def list_my_wines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, description="Filter by status: Tried, Want to Try, Cellar"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get wines owned by the current user.
    Optionally filter by status.
    """
    query = db.query(Wine).filter(Wine.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Wine.status == status_filter)
    
    wines = query.order_by(Wine.created_at.desc()).offset(skip).limit(limit).all()
    return wines


@router.get("/{wine_id}", response_model=WineResponse)
def get_wine(wine_id: int, db: Session = Depends(get_db)):
    """
    Get a specific wine by ID.
    """
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wine not found"
        )
    return wine


@router.patch("/{wine_id}/status", response_model=WineResponse)
def update_wine_status(
    wine_id: int,
    payload: WineStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update the status of a wine (Tried, Want to Try, Cellar).
    """
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wine not found"
        )
    
    # Optional: Check ownership
    # if wine.user_id and wine.user_id != current_user.id:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    wine.status = payload.status
    wine.user_id = current_user.id  # Claim ownership if not already owned
    db.commit()
    db.refresh(wine)
    return wine


@router.patch("/{wine_id}/rating", response_model=WineResponse)
def update_wine_rating(
    wine_id: int,
    payload: WineRatingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update the rating of a wine (1-5 stars).
    """
    wine = db.query(Wine).filter(Wine.id == wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wine not found"
        )
    
    # Validate rating
    if payload.rating is not None and (payload.rating < 1 or payload.rating > 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    wine.rating = payload.rating
    wine.user_id = current_user.id  # Claim ownership if not already owned
    db.commit()
    db.refresh(wine)
    return wine

