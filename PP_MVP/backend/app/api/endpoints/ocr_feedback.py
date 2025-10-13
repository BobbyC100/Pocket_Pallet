"""
OCR Feedback Endpoints

API routes for submitting and retrieving OCR feedback.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.ocr_feedback import OcrFeedback
from app.schemas.ocr_feedback import OcrFeedbackCreate, OcrFeedbackResponse

router = APIRouter()


@router.post("/feedback", response_model=OcrFeedbackResponse)
async def submit_ocr_feedback(
    feedback: OcrFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit feedback on an OCR-parsed wine entry.
    
    Actions:
    - 'accept': User confirms the parsed data is correct
    - 'edit': User corrects one or more fields
    - 'reject': User marks the entry as incorrect/invalid
    """
    # Validate action
    if feedback.action not in ['accept', 'edit', 'reject']:
        raise HTTPException(
            status_code=400,
            detail="Action must be 'accept', 'edit', or 'reject'"
        )
    
    # Create feedback entry
    db_feedback = OcrFeedback(
        raw_text=feedback.raw_text,
        confidence=feedback.confidence,
        parsed_name=feedback.parsed_name,
        parsed_producer=feedback.parsed_producer,
        parsed_region=feedback.parsed_region,
        parsed_vintage=feedback.parsed_vintage,
        parsed_price=feedback.parsed_price,
        action=feedback.action,
        corrected_name=feedback.corrected_name,
        corrected_producer=feedback.corrected_producer,
        corrected_region=feedback.corrected_region,
        corrected_vintage=feedback.corrected_vintage,
        corrected_price=feedback.corrected_price,
        user_id=current_user.id
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback


@router.get("/feedback/recent", response_model=List[OcrFeedbackResponse])
async def get_recent_feedback(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent OCR feedback entries (for debugging/analysis).
    """
    feedback_list = (
        db.query(OcrFeedback)
        .filter(OcrFeedback.user_id == current_user.id)
        .order_by(OcrFeedback.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return feedback_list


@router.get("/feedback/stats")
async def get_feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get OCR feedback statistics for the current user.
    """
    total = db.query(OcrFeedback).filter(OcrFeedback.user_id == current_user.id).count()
    accepted = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'accept'
    ).count()
    edited = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'edit'
    ).count()
    rejected = db.query(OcrFeedback).filter(
        OcrFeedback.user_id == current_user.id,
        OcrFeedback.action == 'reject'
    ).count()
    
    return {
        "total": total,
        "accepted": accepted,
        "edited": edited,
        "rejected": rejected,
        "accuracy": round(accepted / total * 100, 1) if total > 0 else 0
    }

