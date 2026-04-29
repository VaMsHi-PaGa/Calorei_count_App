"""
Data aggregation service for historical analytics and reporting.

Provides functions to calculate historical metrics, trends, and statistics
for weight tracking, food logging, and goal progress.
"""

from datetime import date, datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import FoodLog, WeightLog, User
from app.services.fitness import calculate_bmi


def get_logging_stats(db: Session, user_id: int, start_date: date, end_date: date) -> dict:
    """
    Get logging statistics: total days logged, streaks, etc.

    Returns:
        {
            total_days_logged: int,
            max_streak: int,
            current_streak: int,
            first_log_date: date | None,
            last_log_date: date | None,
            total_period_days: int
        }
    """
    # Get all unique dates with any logging activity
    logged_dates_food = db.query(func.date(FoodLog.created_at)).filter(
        FoodLog.user_id == user_id,
        func.date(FoodLog.created_at) >= start_date,
        func.date(FoodLog.created_at) <= end_date
    ).distinct().all()

    logged_dates_weight = db.query(WeightLog.date).filter(
        WeightLog.user_id == user_id,
        WeightLog.date >= start_date,
        WeightLog.date <= end_date
    ).distinct().all()

    # Combine and sort
    all_dates = set()
    for row in logged_dates_food:
        if row[0]:
            all_dates.add(row[0])
    for row in logged_dates_weight:
        if row[0]:
            all_dates.add(row[0])

    all_dates = sorted(list(all_dates))

    if not all_dates:
        return {
            "total_days_logged": 0,
            "max_streak": 0,
            "current_streak": 0,
            "first_log_date": None,
            "last_log_date": None,
            "total_period_days": (end_date - start_date).days + 1
        }

    # Calculate streaks
    max_streak = 1
    current_streak = 1

    for i in range(1, len(all_dates)):
        if (all_dates[i] - all_dates[i-1]).days == 1:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 1

    total_period_days = (end_date - start_date).days + 1

    return {
        "total_days_logged": len(all_dates),
        "max_streak": max_streak,
        "current_streak": current_streak,
        "first_log_date": all_dates[0],
        "last_log_date": all_dates[-1],
        "total_period_days": total_period_days
    }


def get_average_metrics(db: Session, user_id: int, start_date: date, end_date: date) -> dict:
    """
    Calculate average metrics for a period.

    Returns:
        {
            avg_calories: float,
            avg_protein: float,
            avg_carbs: float,
            avg_fat: float,
            avg_weight: float | None,
            avg_bmi: float | None,
            days_with_food_logs: int,
            days_with_weight_logs: int
        }
    """
    # Get daily food totals
    food_daily = db.query(
        func.date(FoodLog.created_at).label("day"),
        func.sum(FoodLog.calories).label("total_calories"),
        func.sum(FoodLog.protein).label("total_protein"),
        func.sum(FoodLog.carbs).label("total_carbs"),
        func.sum(FoodLog.fat).label("total_fat")
    ).filter(
        FoodLog.user_id == user_id,
        func.date(FoodLog.created_at) >= start_date,
        func.date(FoodLog.created_at) <= end_date
    ).group_by(func.date(FoodLog.created_at)).all()

    # Calculate averages for food
    if food_daily:
        avg_calories = sum(row.total_calories or 0 for row in food_daily) / len(food_daily)
        avg_protein = sum(row.total_protein or 0 for row in food_daily) / len(food_daily)
        avg_carbs = sum(row.total_carbs or 0 for row in food_daily) / len(food_daily)
        avg_fat = sum(row.total_fat or 0 for row in food_daily) / len(food_daily)
        days_with_food_logs = len(food_daily)
    else:
        avg_calories = 0
        avg_protein = 0
        avg_carbs = 0
        avg_fat = 0
        days_with_food_logs = 0

    # Get weight data
    weights = db.query(WeightLog).filter(
        WeightLog.user_id == user_id,
        WeightLog.date >= start_date,
        WeightLog.date <= end_date
    ).order_by(WeightLog.date).all()

    if weights:
        avg_weight = sum(w.weight for w in weights) / len(weights)
        days_with_weight_logs = len(weights)

        # Get user height for BMI calculation
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            avg_bmi = calculate_bmi(user.height, avg_weight)
        else:
            avg_bmi = None
    else:
        avg_weight = None
        avg_bmi = None
        days_with_weight_logs = 0

    return {
        "avg_calories": round(avg_calories, 2),
        "avg_protein": round(avg_protein, 2),
        "avg_carbs": round(avg_carbs, 2),
        "avg_fat": round(avg_fat, 2),
        "avg_weight": round(avg_weight, 2) if avg_weight else None,
        "avg_bmi": round(avg_bmi, 2) if avg_bmi else None,
        "days_with_food_logs": days_with_food_logs,
        "days_with_weight_logs": days_with_weight_logs
    }


def get_best_worst_days(
    db: Session, user_id: int, metric: str, start_date: date, end_date: date
) -> dict:
    """
    Get best and worst days for a specific metric.

    Args:
        metric: "calories", "protein", "carbs", "fat", or "weight"

    Returns:
        {
            best_day: date | None,
            best_value: float | None,
            worst_day: date | None,
            worst_value: float | None
        }
    """
    if metric in ["calories", "protein", "carbs", "fat"]:
        # Food-based metrics
        daily_data = db.query(
            func.date(FoodLog.created_at).label("day"),
            func.sum(getattr(FoodLog, metric.split("_")[0] if metric != "calories" else "calories")).label("total")
        ).filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.created_at) >= start_date,
            func.date(FoodLog.created_at) <= end_date
        ).group_by(func.date(FoodLog.created_at)).all()

        if not daily_data:
            return {"best_day": None, "best_value": None, "worst_day": None, "worst_value": None}

        daily_data = [(row.day, row.total or 0) for row in daily_data]

        best_day, best_value = max(daily_data, key=lambda x: x[1])
        worst_day, worst_value = min(daily_data, key=lambda x: x[1])

        return {
            "best_day": best_day,
            "best_value": round(best_value, 2),
            "worst_day": worst_day,
            "worst_value": round(worst_value, 2)
        }

    elif metric == "weight":
        weights = db.query(WeightLog.date, WeightLog.weight).filter(
            WeightLog.user_id == user_id,
            WeightLog.date >= start_date,
            WeightLog.date <= end_date
        ).all()

        if not weights:
            return {"best_day": None, "best_value": None, "worst_day": None, "worst_value": None}

        best_day, best_value = min(weights, key=lambda x: x[1])
        worst_day, worst_value = max(weights, key=lambda x: x[1])

        return {
            "best_day": best_day,
            "best_value": round(best_value, 2),
            "worst_day": worst_day,
            "worst_value": round(worst_value, 2)
        }

    return {"best_day": None, "best_value": None, "worst_day": None, "worst_value": None}


def get_food_frequency(db: Session, user_id: int, start_date: date, end_date: date, top_n: int = 10) -> list[dict]:
    """
    Get most frequently logged foods.

    Returns:
        [
            {
                "food_text": str,
                "count": int,
                "category": str (estimated)
            },
            ...
        ]
    """
    food_counts = db.query(
        func.lower(FoodLog.food_text).label("food"),
        func.count(FoodLog.id).label("count")
    ).filter(
        FoodLog.user_id == user_id,
        func.date(FoodLog.created_at) >= start_date,
        func.date(FoodLog.created_at) <= end_date
    ).group_by(func.lower(FoodLog.food_text)).order_by(func.count(FoodLog.id).desc()).limit(top_n).all()

    result = []
    for row in food_counts:
        food_text = row.food or "Unknown"
        # Simple category estimation based on keywords
        category = _estimate_food_category(food_text)

        result.append({
            "food_text": food_text,
            "count": row.count,
            "category": category
        })

    return result


def get_weight_trend(db: Session, user_id: int, days: int = 30) -> dict:
    """
    Analyze weight trend: direction, slope, variance.

    Returns:
        {
            "trend": "declining" | "stable" | "increasing",
            "slope": float (kg per week),
            "variance": float,
            "insight": str
        }
    """
    start_date = date.today() - timedelta(days=days)
    weights = db.query(WeightLog).filter(
        WeightLog.user_id == user_id,
        WeightLog.date >= start_date
    ).order_by(WeightLog.date).all()

    if len(weights) < 2:
        return {
            "trend": "stable",
            "slope": 0,
            "variance": 0,
            "insight": "Not enough data to determine trend"
        }

    weight_values = [w.weight for w in weights]

    # Calculate slope (simple: (last - first) / weeks)
    first_weight = weight_values[0]
    last_weight = weight_values[-1]
    num_days = (weights[-1].date - weights[0].date).days
    num_weeks = max(num_days / 7, 1)  # Avoid division by zero
    slope = (last_weight - first_weight) / num_weeks

    # Determine trend
    if slope < -0.3:
        trend = "declining"
        insight = "Great progress! Keep your current approach consistent."
    elif slope > 0.3:
        trend = "increasing"
        insight = "Gentle redirect: Consider increasing activity or reviewing portions."
    else:
        trend = "stable"
        insight = "Your weight is stable—focus on metrics like strength or energy."

    # Calculate variance
    avg_weight = sum(weight_values) / len(weight_values)
    variance = sum((w - avg_weight) ** 2 for w in weight_values) / len(weight_values)

    return {
        "trend": trend,
        "slope": round(slope, 2),
        "variance": round(variance, 2),
        "insight": insight
    }


def calculate_consistency_score(db: Session, user_id: int, start_date: date, end_date: date) -> float:
    """
    Calculate consistency score: (days_with_logs / total_days) * 100
    """
    total_days = (end_date - start_date).days + 1

    # Get unique days with any logging
    logged_dates = db.query(func.date(FoodLog.created_at)).filter(
        FoodLog.user_id == user_id,
        func.date(FoodLog.created_at) >= start_date,
        func.date(FoodLog.created_at) <= end_date
    ).distinct().all()

    logged_weight_dates = db.query(WeightLog.date).filter(
        WeightLog.user_id == user_id,
        WeightLog.date >= start_date,
        WeightLog.date <= end_date
    ).distinct().all()

    all_logged = set()
    for row in logged_dates:
        if row[0]:
            all_logged.add(row[0])
    for row in logged_weight_dates:
        if row[0]:
            all_logged.add(row[0])

    days_logged = len(all_logged)
    consistency = (days_logged / total_days * 100) if total_days > 0 else 0

    return round(consistency, 1)


def _estimate_food_category(food_text: str) -> str:
    """Simple heuristic to estimate food category from text."""
    food_lower = food_text.lower()

    # Protein sources
    if any(word in food_lower for word in ["chicken", "beef", "pork", "fish", "salmon", "tuna", "egg", "meat", "steak"]):
        return "Protein"

    # Vegetables
    if any(word in food_lower for word in ["broccoli", "spinach", "lettuce", "carrot", "vegetable", "salad", "greens"]):
        return "Vegetable"

    # Fruits
    if any(word in food_lower for word in ["apple", "banana", "orange", "berry", "fruit", "grape"]):
        return "Fruit"

    # Grains/Carbs
    if any(word in food_lower for word in ["rice", "pasta", "bread", "cereal", "grain", "oats"]):
        return "Grain"

    # Processed/Snacks
    if any(word in food_lower for word in ["chips", "candy", "soda", "processed", "fast food", "burger", "pizza"]):
        return "Processed"

    # Dairy
    if any(word in food_lower for word in ["milk", "cheese", "yogurt", "butter"]):
        return "Dairy"

    return "Other"
