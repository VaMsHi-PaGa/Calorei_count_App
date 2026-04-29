from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.food_log import FoodLog
from app.models.user import User
from app.schemas import FoodLogCreate, FoodLogRead
from app.services.ai import get_food_nutrition

router = APIRouter(prefix="/food-log", tags=["food-log"])


@router.post("", response_model=FoodLogRead, status_code=status.HTTP_201_CREATED)
def create_food_log(
    payload: FoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    food_text = payload.food_text
    nutrition = {
        "calories": payload.calories,
        "protein": payload.protein,
        "carbs": payload.carbs,
        "fat": payload.fat,
    }
    if any(value is None for value in nutrition.values()):
        nutrition = get_food_nutrition(food_text)

    food_log = FoodLog(
        user_id=current_user.id,
        food_text=food_text,
        calories=float(nutrition["calories"]),
        protein=float(nutrition["protein"]),
        carbs=float(nutrition["carbs"]),
        fat=float(nutrition["fat"]),
    )
    db.add(food_log)
    db.commit()
    db.refresh(food_log)
    return food_log


@router.get("", response_model=list[FoodLogRead])
def list_food_logs(
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    today_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)
    if today_only:
        start = datetime.combine(date.today(), time.min, tzinfo=timezone.utc)
        query = query.filter(FoodLog.created_at >= start)

    return query.order_by(FoodLog.created_at.desc(), FoodLog.id.desc()).limit(limit).all()
