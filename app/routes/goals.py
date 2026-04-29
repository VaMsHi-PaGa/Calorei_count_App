"""
Goal management routes.

Endpoints for creating, reading, updating, and deleting user weight/fitness goals.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import UserGoal, User, WeightLog
from app.schemas import UserGoalCreate, UserGoalUpdate, UserGoalRead
from app.middleware.auth import get_current_user
from app.services.fitness import calculate_nutritional_targets
from sqlalchemy import desc

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.post("", response_model=UserGoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: UserGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserGoalRead:
    """
    Create or replace user's fitness goal.

    A user can only have one active goal at a time. Creating a new goal
    replaces any existing goal.

    Args:
        goal_data: Goal parameters (weight_target, target_date, etc.)

    Returns:
        Created/updated goal object
    """
    # Delete existing goal if present (one goal per user)
    existing_goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()
    if existing_goal:
        db.delete(existing_goal)

    # Get current weight for nutritional calculations
    latest_weight_log = (
        db.query(WeightLog)
        .filter(WeightLog.user_id == current_user.id)
        .order_by(desc(WeightLog.date), desc(WeightLog.id))
        .first()
    )
    current_weight = latest_weight_log.weight if latest_weight_log else None

    # Calculate nutritional targets if not provided by user
    calculated_targets = {}
    if current_weight:
        calculated_targets = calculate_nutritional_targets(
            user=current_user,
            current_weight=current_weight,
            goal_weight=goal_data.weight_target,
        )

    # Use user-provided values or fall back to calculated defaults
    daily_calorie_target = goal_data.daily_calorie_target or calculated_targets.get("daily_calorie_target")
    daily_protein_target = goal_data.daily_protein_target or calculated_targets.get("daily_protein_target")
    daily_water_target = goal_data.daily_water_target or calculated_targets.get("daily_water_target")

    # Create new goal
    new_goal = UserGoal(
        user_id=current_user.id,
        weight_target=goal_data.weight_target,
        target_date=goal_data.target_date,
        weekly_loss_rate=goal_data.weekly_loss_rate,
        daily_calorie_target=daily_calorie_target,
        daily_protein_target=daily_protein_target,
        daily_water_target=daily_water_target,
        custom_tips_enabled=goal_data.custom_tips_enabled,
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


@router.get("", response_model=UserGoalRead)
def get_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserGoalRead:
    """
    Get user's current fitness goal.

    Returns:
        Current goal object, or 404 if no goal exists
    """
    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No goal found for this user",
        )

    return goal


@router.patch("", response_model=UserGoalRead)
def update_goal(
    goal_update: UserGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserGoalRead:
    """
    Update user's fitness goal (partial update).

    Only provided fields are updated; omitted fields remain unchanged.

    Args:
        goal_update: Fields to update (all optional)

    Returns:
        Updated goal object
    """
    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No goal found for this user",
        )

    # Update provided fields
    update_data = goal_update.model_dump(exclude_unset=True)

    # Validate that required fields cannot both be set to None
    weight_target = update_data.get("weight_target", goal.weight_target)
    target_date = update_data.get("target_date", goal.target_date)

    if weight_target is None or target_date is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="weight_target and target_date are required and cannot be null",
        )

    for field, value in update_data.items():
        setattr(goal, field, value)

    goal.updated_at = datetime.utcnow()

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete user's fitness goal.

    Returns:
        204 No Content on success
    """
    goal = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).first()

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No goal found for this user",
        )

    db.delete(goal)
    db.commit()
