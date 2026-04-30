from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.services.streaks import get_or_create_streak

router = APIRouter(prefix="/api/streaks", tags=["streaks"])

@router.get("")
def get_streaks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = get_or_create_streak(db, current_user.id)
    return {
        "food_streak": s.food_streak,
        "food_best_streak": s.food_best_streak,
        "food_last_logged": s.food_last_logged,
        "water_streak": s.water_streak,
        "water_best_streak": s.water_best_streak,
        "water_last_logged": s.water_last_logged,
        "weight_streak": s.weight_streak,
        "weight_best_streak": s.weight_best_streak,
        "weight_last_logged": s.weight_last_logged,
    }
