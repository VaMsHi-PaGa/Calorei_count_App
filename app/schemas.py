from __future__ import annotations

from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, description="Minimum 8 characters")
    height: float = Field(gt=0, le=300, description="Height in centimeters")
    age: int = Field(gt=0, le=150, description="Age in years")
    gender: str = Field(min_length=1)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    height: float
    age: int
    gender: str


class FoodLogCreate(BaseModel):
    food_text: str = Field(min_length=1)
    calories: float | None = Field(default=None, ge=0)
    protein: float | None = Field(default=None, ge=0)
    carbs: float | None = Field(default=None, ge=0)
    fat: float | None = Field(default=None, ge=0)


class FoodLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    food_text: str
    calories: float
    protein: float
    carbs: float
    fat: float
    created_at: datetime


class WeightLogCreate(BaseModel):
    weight: float = Field(gt=0)
    date: date_type | None = None


class WeightLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    weight: float
    date: date_type


class DashboardRead(BaseModel):
    user: UserRead
    bmi: float | None
    calorie_target: float | None
    latest_weight: float | None
    total_calories_today: float
    total_protein_today: float
    total_carbs_today: float
    total_fat_today: float


class SignupPayload(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, description="Minimum 8 characters")
    height: float = Field(gt=0, le=300, description="Height in centimeters")
    age: int = Field(gt=0, le=150, description="Age in years")
    gender: str = Field(min_length=1)


class UserGoalCreate(BaseModel):
    weight_target: float = Field(gt=0, le=500, description="Target weight in kg")
    target_date: datetime = Field(description="Deadline to reach goal")
    weekly_loss_rate: float | None = Field(default=None, gt=0, description="Target kg per week")
    daily_calorie_target: int | None = Field(default=None, gt=500, le=5000, description="Override calculated target")
    daily_protein_target: float | None = Field(default=None, gt=0, description="Daily protein target in grams")
    daily_water_target: float | None = Field(default=None, gt=0, description="Daily water target in ml")
    custom_tips_enabled: bool = Field(default=True, description="Enable AI-generated tips")


class UserGoalUpdate(BaseModel):
    weight_target: float | None = Field(default=None, gt=0, le=500)
    target_date: datetime | None = Field(default=None)
    weekly_loss_rate: float | None = Field(default=None, gt=0)
    daily_calorie_target: int | None = Field(default=None, gt=500, le=5000)
    daily_protein_target: float | None = Field(default=None, gt=0)
    daily_water_target: float | None = Field(default=None, gt=0)
    custom_tips_enabled: bool | None = Field(default=None)


class UserGoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    weight_target: float
    target_date: datetime
    weekly_loss_rate: float | None
    daily_calorie_target: int | None
    daily_protein_target: float | None
    daily_water_target: float | None
    custom_tips_enabled: bool
    created_at: datetime
    updated_at: datetime


class LoginPayload(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserRead
    expires_in: int


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, description="Minimum 8 characters")
