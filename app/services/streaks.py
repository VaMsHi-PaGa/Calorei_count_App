from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user_streak import UserStreak

def get_or_create_streak(db: Session, user_id: int) -> UserStreak:
    streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    if not streak:
        streak = UserStreak(user_id=user_id)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

def update_streak(db: Session, user_id: int, log_type: str) -> UserStreak:
    """log_type: 'food' | 'water' | 'weight'"""
    streak = get_or_create_streak(db, user_id)
    today = datetime.now(timezone.utc).date()

    last_attr = f"{log_type}_last_logged"
    cur_attr = f"{log_type}_streak"
    best_attr = f"{log_type}_best_streak"

    last_logged: datetime | None = getattr(streak, last_attr)
    current = getattr(streak, cur_attr)
    best = getattr(streak, best_attr)

    if last_logged is not None:
        last_date = last_logged.date()
        diff = (today - last_date).days
        if diff == 0:
            return streak   # already logged today
        elif diff == 1:
            current += 1    # consecutive day
        else:
            current = 1     # streak broken
    else:
        current = 1

    now = datetime.now(timezone.utc)
    setattr(streak, last_attr, now)
    setattr(streak, cur_attr, current)
    setattr(streak, best_attr, max(best, current))
    streak.updated_at = now
    db.commit()
    db.refresh(streak)
    return streak
