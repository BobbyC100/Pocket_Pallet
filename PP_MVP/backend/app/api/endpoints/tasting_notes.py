"""
Tasting Notes API Endpoints

CRUD operations for structured wine tasting notes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.tasting_note import TastingNoteCreate, TastingNoteResponse
from app.models.tasting_note import TastingNote
from app.models.wine import Wine
from app.api.deps import get_current_user


router = APIRouter()


@router.post("", response_model=TastingNoteResponse)
def create_tasting_note(
    payload: TastingNoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a new tasting note for a wine.
    
    Validates that the wine exists and associates the note with the current user.
    """
    # Ensure wine exists
    wine = db.query(Wine).filter(Wine.id == payload.wine_id).first()
    if not wine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wine not found"
        )

    tn = TastingNote(
        wine_id=payload.wine_id,
        user_id=current_user.id,
        appearance_clarity=payload.appearance_clarity,
        appearance_color=payload.appearance_color,
        appearance_intensity=payload.appearance_intensity,
        aroma_primary=payload.aroma_primary,
        aroma_secondary=payload.aroma_secondary,
        aroma_tertiary=payload.aroma_tertiary,
        palate_sweetness=payload.palate_sweetness,
        palate_acidity=payload.palate_acidity,
        palate_tannin=payload.palate_tannin,
        palate_body=payload.palate_body,
        palate_alcohol=payload.palate_alcohol,
        flavor_characteristics=payload.flavor_characteristics,
        finish_length=payload.finish_length,
    )
    db.add(tn)
    db.commit()
    db.refresh(tn)
    return tn


@router.get("/by-wine/{wine_id}", response_model=List[TastingNoteResponse])
def list_tasting_notes_for_wine(
    wine_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get all tasting notes for a specific wine (current user only).
    """
    items = (
        db.query(TastingNote)
        .filter(
            TastingNote.wine_id == wine_id,
            TastingNote.user_id == current_user.id
        )
        .order_by(TastingNote.created_at.desc())
        .all()
    )
    return items


@router.get("/my", response_model=List[TastingNoteResponse])
def list_my_tasting_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get all tasting notes for the current user (paginated).
    """
    items = (
        db.query(TastingNote)
        .filter(TastingNote.user_id == current_user.id)
        .order_by(TastingNote.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items


@router.get("/palate/profile")
def get_palate_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Compute aggregate palate profile for the current user.
    
    Returns average scores across all tasting notes to build
    a personalized taste profile.
    """
    from sqlalchemy import func as sqlfunc
    
    profile = db.query(
        sqlfunc.avg(TastingNote.palate_sweetness).label('avg_sweetness'),
        sqlfunc.avg(TastingNote.palate_acidity).label('avg_acidity'),
        sqlfunc.avg(TastingNote.palate_tannin).label('avg_tannin'),
        sqlfunc.avg(TastingNote.palate_body).label('avg_body'),
        sqlfunc.avg(TastingNote.palate_alcohol).label('avg_alcohol'),
        sqlfunc.avg(TastingNote.finish_length).label('avg_finish'),
        sqlfunc.count(TastingNote.id).label('total_notes'),
    ).filter(
        TastingNote.user_id == current_user.id
    ).first()
    
    return {
        "avg_sweetness": round(profile.avg_sweetness, 2) if profile.avg_sweetness else None,
        "avg_acidity": round(profile.avg_acidity, 2) if profile.avg_acidity else None,
        "avg_tannin": round(profile.avg_tannin, 2) if profile.avg_tannin else None,
        "avg_body": round(profile.avg_body, 2) if profile.avg_body else None,
        "avg_alcohol": round(profile.avg_alcohol, 2) if profile.avg_alcohol else None,
        "avg_finish": round(profile.avg_finish, 2) if profile.avg_finish else None,
        "total_notes": profile.total_notes,
    }

