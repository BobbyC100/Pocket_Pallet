from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
import secrets

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import LoginResponse
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.services.user_service import user_service
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.password_reset import PasswordReset

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = user_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user
    """
    try:
        user = user_service.create(db, user_create)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user
    """
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Request a password reset token.
    In production, this would send an email.
    For dev, it returns the reset link in the response.
    """
    # Check if user exists
    user = user_service.get_by_email(db, request.email)
    
    # Always return success to prevent email enumeration
    if not user:
        return ForgotPasswordResponse(
            message="If that email exists, a reset link has been sent.",
            reset_link=None
        )
    
    # Generate secure token
    token = secrets.token_urlsafe(32)
    
    # Create password reset record (expires in 1 hour)
    reset_record = PasswordReset(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False
    )
    
    db.add(reset_record)
    db.commit()
    
    # In production, send email here
    # For dev, we'll return the reset link and log it
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    print(f"\n{'='*60}")
    print(f"🔐 PASSWORD RESET REQUESTED")
    print(f"{'='*60}")
    print(f"Email: {request.email}")
    print(f"Reset Link: {reset_link}")
    print(f"Expires: {reset_record.expires_at}")
    print(f"{'='*60}\n")
    
    return ForgotPasswordResponse(
        message="If that email exists, a reset link has been sent.",
        reset_link=reset_link  # Remove this in production
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using a valid token
    """
    # Find the reset token
    reset_record = db.query(PasswordReset).filter(
        PasswordReset.token == request.token
    ).first()
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is valid
    if not reset_record.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get the user
    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    
    # Mark token as used
    reset_record.used = True
    
    db.commit()
    
    print(f"\n{'='*60}")
    print(f"✅ PASSWORD RESET SUCCESSFUL")
    print(f"{'='*60}")
    print(f"User: {user.email}")
    print(f"Time: {datetime.utcnow()}")
    print(f"{'='*60}\n")
    
    return ResetPasswordResponse(
        message="Password has been reset successfully. You can now log in with your new password."
    )

