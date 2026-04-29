from datetime import date

from sqlalchemy import Column, Date, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base


class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    weight = Column(Float, nullable=False)
    date = Column(Date, default=date.today, nullable=False)

    user = relationship("User", back_populates="weight_logs")
