from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class UserStreak(Base):
    __tablename__ = "user_streaks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    food_streak = Column(Integer, default=0, nullable=False)
    food_best_streak = Column(Integer, default=0, nullable=False)
    food_last_logged = Column(DateTime(timezone=True), nullable=True)
    water_streak = Column(Integer, default=0, nullable=False)
    water_best_streak = Column(Integer, default=0, nullable=False)
    water_last_logged = Column(DateTime(timezone=True), nullable=True)
    weight_streak = Column(Integer, default=0, nullable=False)
    weight_best_streak = Column(Integer, default=0, nullable=False)
    weight_last_logged = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    user = relationship("User", back_populates="streak")
