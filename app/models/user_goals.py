from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class UserGoal(Base):
    """
    User's weight, calorie, protein, and water goals.

    Each user can have one active goal with:
    - Weight target in kg
    - Target deadline date/time
    - Optional custom daily calorie, protein, water targets
    - Preference to enable/disable AI-generated tips
    """

    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Weight goal
    weight_target = Column(Float, nullable=False)  # Target weight in kg
    target_date = Column(DateTime(timezone=True), nullable=False)  # Deadline for reaching goal
    weekly_loss_rate = Column(Float, nullable=True)  # Target kg per week (optional, calculated)

    # Optional custom targets (override auto-calculated values)
    daily_calorie_target = Column(Integer, nullable=True)  # kcal
    daily_protein_target = Column(Float, nullable=True)  # grams
    daily_water_target = Column(Float, nullable=True)  # ml

    # Feature preferences
    custom_tips_enabled = Column(Boolean, default=True)  # Whether to show AI suggestions

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationship to User
    user = relationship("User", back_populates="goals")

    def __repr__(self) -> str:
        return (
            f"<UserGoal(id={self.id}, user_id={self.user_id}, "
            f"weight_target={self.weight_target}kg, target_date={self.target_date})>"
        )
