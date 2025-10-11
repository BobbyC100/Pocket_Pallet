from typing import Optional
import uuid
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create(db: Session, user_create: UserCreate) -> User:
        """Create a new user"""
        # Check if user exists
        if UserService.get_by_email(db, user_create.email):
            raise ValueError("Email already registered")
        
        if UserService.get_by_username(db, user_create.username):
            raise ValueError("Username already taken")
        
        # Create user
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_create.email,
            username=user_create.username,
            hashed_password=get_password_hash(user_create.password),
            is_active=True,
            is_superuser=False,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user"""
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def update(db: Session, user: User, user_update: UserUpdate) -> User:
        """Update user"""
        update_data = user_update.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_service = UserService()

