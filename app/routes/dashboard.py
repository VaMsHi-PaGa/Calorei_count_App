from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.food_log import FoodLog
from app.models.user import User
from app.models.weight_log import WeightLog
from app.models.user_goals import UserGoal
from app.schemas import DashboardRead
from app.services.fitness import calculate_bmi, calculate_calorie_target

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardRead)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    latest_weight_log = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(desc(WeightLog.date), desc(WeightLog.id))
        .first()
    )
    latest_weight = latest_weight_log.weight if latest_weight_log else None

    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()

    today_start = datetime.combine(date.today(), time.min, tzinfo=timezone.utc)
    today_end = datetime.combine(date.today(), time.max, tzinfo=timezone.utc)
    totals = (
        db.query(
            func.coalesce(func.sum(FoodLog.calories), 0),
            func.coalesce(func.sum(FoodLog.protein), 0),
            func.coalesce(func.sum(FoodLog.carbs), 0),
            func.coalesce(func.sum(FoodLog.fat), 0),
        )
        .filter(
            FoodLog.user_id == current_user.id,
            FoodLog.created_at >= today_start,
            FoodLog.created_at <= today_end,
        )
        .one()
    )

    return {
        "user": current_user,
        "bmi": calculate_bmi(current_user.height, latest_weight),
        "calorie_target": calculate_calorie_target(current_user, latest_weight, goal),
        "latest_weight": latest_weight,
        "total_calories_today": float(totals[0]),
        "total_protein_today": float(totals[1]),
        "total_carbs_today": float(totals[2]),
        "total_fat_today": float(totals[3]),
    }
