from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access other user's data")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user


class UserUpdate(BaseModel):
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    preferred_name: str | None = None
    age: int | None = Field(None, gt=0, le=150)
    height: float | None = Field(None, gt=0, le=300)
    gender: str | None = None


@router.patch("/profile", response_model=UserRead)
def update_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Update only provided fields
    if payload.email is not None:
        current_user.email = payload.email
    if payload.first_name is not None:
        current_user.first_name = payload.first_name
    if payload.last_name is not None:
        current_user.last_name = payload.last_name
    if payload.preferred_name is not None:
        current_user.preferred_name = payload.preferred_name
    if payload.age is not None:
        current_user.age = payload.age
    if payload.height is not None:
        current_user.height = payload.height
    if payload.gender is not None:
        current_user.gender = payload.gender

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists") from exc

    db.refresh(current_user)
    return current_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only allow users to delete themselves or admin to delete any user
    if user_id != current_user.id and current_user.id != 1:  # Assuming ID 1 is admin
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete other user's data")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
    return None
