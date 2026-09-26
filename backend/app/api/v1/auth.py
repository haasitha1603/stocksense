from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.config import settings
from app.models import User, Organization
from app.schemas import (
    Token, UserLogin, UserCreate, UserResponse,
    PasswordResetRequest, PasswordResetConfirm
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create Organization
    org_code = user_in.organization_name.lower().replace(" ", "-")[:20] + "-org"
    existing_org = db.query(Organization).filter(Organization.code == org_code).first()
    if existing_org:
        org = existing_org
    else:
        org = Organization(
            name=user_in.organization_name,
            code=org_code
        )
        db.add(org)
        db.flush()

    user = User(
        organization_id=org.id,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": org.id,
            "organization_name": org.name
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id,
            "organization_name": org.name if org else "Default Workspace"
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "organization_id": current_user.organization_id,
        "organization_name": org.name if org else "Default Workspace",
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

@router.post("/reset-password-request")
def reset_password_request(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Mock OTP flow labeled clearly as non-production development demo
    return {
        "message": "Development Mock OTP: Use OTP '123456' to reset password for demonstration purposes.",
        "email": req.email,
        "is_mock": True
    }

@router.post("/reset-password-confirm")
def reset_password_confirm(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    if req.otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You can now log in with your new password."}
