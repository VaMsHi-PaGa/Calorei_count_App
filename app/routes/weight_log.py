from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas import WeightLogCreate, WeightLogRead

router = APIRouter(prefix="/weight-log", tags=["weight-log"])


@router.post("", response_model=WeightLogRead, status_code=status.HTTP_201_CREATED)
def create_weight_log(
    payload: WeightLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump()
    if data["date"] is None:
        data["date"] = date.today()

    weight_log = WeightLog(
        user_id=current_user.id,
        weight=data["weight"],
        date=data["date"],
    )
    db.add(weight_log)
    db.commit()
    db.refresh(weight_log)
    return weight_log


@router.get("", response_model=list[WeightLogRead])
def list_weight_logs(
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=7, ge=1, le=365),
    db: Session = Depends(get_db),
):
    return (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id,
            WeightLog.date >= date.today() - timedelta(days=limit - 1),
        )
        .order_by(WeightLog.date.desc(), WeightLog.id.desc())
        .limit(limit)
        .all()
    )
