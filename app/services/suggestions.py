"""
Suggestions and tips service for personalized recommendations.

Provides:
- Habit-based tips (streaks, consistency, etc.)
- Macro-based suggestions (protein targets, calorie adjustments)
- Goal progress insights (on-track, pace adjustments)
- AI-powered personalized tips via Ollama (optional)
"""

from datetime import date, datetime, timedelta
import logging
from typing import Optional
from sqlalchemy.orm import Session
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

from app.models import User, UserGoal, WeightLog, FoodLog
from app.services.aggregation import (
    get_logging_stats,
    get_average_metrics,
    get_weight_trend,
    calculate_consistency_score,
)

logger = logging.getLogger(__name__)

# Ollama configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"
OLLAMA_TIMEOUT = 15  # seconds

# Thresholds for suggestions
MIN_WEIGHT_LOGS_FOR_TREND = 5
MIN_LOGGING_DAYS = 7
EXCELLENT_CONSISTENCY = 90
GOOD_CONSISTENCY = 70


class Suggestion:
    """A single actionable tip or recommendation."""

    def __init__(
        self,
        title: str,
        description: str,
        category: str,
        priority: str = "medium",
        action: Optional[str] = None,
    ):
        """
        Args:
            title: Short title of the suggestion
            description: Detailed explanation
            category: "habit", "nutrition", "goal_pace", "ai_insight"
            priority: "high", "medium", "low"
            action: Optional action to take (e.g., "increase_protein_target")
        """
        self.title = title
        self.description = description
        self.category = category
        self.priority = priority
        self.action = action

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "action": self.action,
        }


def get_suggestions(
    db: Session,
    user_id: int,
    days: int = 7,
    use_ai: bool = True,
) -> list[Suggestion]:
    """
    Generate personalized suggestions based on user behavior and goals.

    Analyzes:
    - Logging consistency and streaks
    - Weight trend vs goal pace
    - Macro compliance vs targets
    - Goal progress and time remaining

    Args:
        db: Database session
        user_id: User ID
        days: Lookback period for analysis (default 7 days)
        use_ai: Whether to query Ollama for AI-generated tips

    Returns:
        List of Suggestion objects, sorted by priority (high → low)
    """
    suggestions = []

    # Get user and goal
    user = db.query(User).filter(User.id == user_id).first()
    goal = db.query(UserGoal).filter(UserGoal.user_id == user_id).first() if user else None

    if not user:
        return suggestions

    # Date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Get metrics
    stats = get_logging_stats(db, user_id, start_date, end_date)
    metrics = get_average_metrics(db, user_id, start_date, end_date)
    consistency = calculate_consistency_score(db, user_id, start_date, end_date)

    # Habit-based suggestions
    suggestions.extend(_get_habit_suggestions(stats, consistency, days))

    # Nutrition-based suggestions
    if metrics:
        suggestions.extend(_get_nutrition_suggestions(metrics, goal))

    # Goal progress suggestions
    if goal:
        suggestions.extend(_get_goal_progress_suggestions(db, user_id, goal, metrics))

    # Weight trend suggestions
    trend = get_weight_trend(db, user_id, days)
    if trend and trend.get("trend") != "stable":
        suggestions.extend(_get_trend_suggestions(trend, goal))

    # AI-powered suggestions
    if use_ai and metrics and goal:
        ai_suggestions = _get_ai_suggestions(user, goal, metrics, stats, consistency)
        if ai_suggestions:
            suggestions.extend(ai_suggestions)

    # Sort by priority (high → low), then by category
    priority_order = {"high": 0, "medium": 1, "low": 2}
    suggestions.sort(key=lambda s: (priority_order.get(s.priority, 1), s.category))

    return suggestions


def _get_habit_suggestions(stats: dict, consistency: float, days: int) -> list[Suggestion]:
    """Generate suggestions based on logging habits and streaks."""
    suggestions = []

    # Current streak
    if stats.get("current_streak", 0) > 0:
        streak = stats["current_streak"]
        if streak >= 7:
            suggestions.append(
                Suggestion(
                    title=f"Amazing Streak! {streak} Days of Logging",
                    description=f"You've logged consistently for {streak} days. This dedication builds lasting habits—keep it up!",
                    category="habit",
                    priority="medium",
                )
            )
        elif streak >= 3:
            suggestions.append(
                Suggestion(
                    title=f"Good Start: {streak} Day Streak",
                    description="You're building momentum with consistent logging. Try to extend this streak to 30+ days for habit formation.",
                    category="habit",
                    priority="medium",
                )
            )

    # Consistency feedback
    if consistency < GOOD_CONSISTENCY:
        if consistency < 30:
            suggestions.append(
                Suggestion(
                    title="Consistency is Key",
                    description=f"You've logged {consistency:.0f}% of days in the past week. Aim for 90%+ to see accurate trends and progress.",
                    category="habit",
                    priority="high",
                )
            )
        else:
            suggestions.append(
                Suggestion(
                    title="Increase Logging Frequency",
                    description=f"Current consistency: {consistency:.0f}%. Try logging daily—even rough estimates help you stay aware of intake.",
                    category="habit",
                    priority="medium",
                )
            )
    elif consistency >= EXCELLENT_CONSISTENCY:
        suggestions.append(
            Suggestion(
                title="Perfect Consistency!",
                description=f"You've logged {consistency:.0f}% of days. This high consistency enables accurate analysis and predictable progress.",
                category="habit",
                priority="low",
            )
        )

    # Missing logs alert (if applicable)
    if stats.get("total_days_logged", 0) < MIN_LOGGING_DAYS:
        suggestions.append(
            Suggestion(
                title="More Data Needed",
                description=f"You've logged {stats.get('total_days_logged', 0)} days. Continue for at least {MIN_LOGGING_DAYS} days to unlock meaningful reports and trends.",
                category="habit",
                priority="medium",
            )
        )

    return suggestions


def _get_nutrition_suggestions(metrics: dict, goal: Optional[UserGoal]) -> list[Suggestion]:
    """Generate suggestions based on macro compliance."""
    suggestions = []

    if not metrics or not goal:
        return suggestions

    # Protein analysis
    avg_protein = metrics.get("avg_protein", 0)
    target_protein = goal.daily_protein_target or _estimate_protein_target(metrics)

    if target_protein and avg_protein < target_protein * 0.8:  # 80%+ of target
        deficit = target_protein - avg_protein
        suggestions.append(
            Suggestion(
                title="Increase Protein Intake",
                description=f"Your average protein is {avg_protein:.0f}g, but target is {target_protein:.0f}g. Protein supports muscle retention during weight loss. Add lean meats, fish, eggs, or Greek yogurt.",
                category="nutrition",
                priority="high",
                action="increase_protein",
            )
        )

    # Calorie analysis
    avg_calories = metrics.get("avg_calories", 0)
    target_calories = goal.daily_calorie_target or _estimate_calorie_target(goal)

    if target_calories:
        if avg_calories > target_calories * 1.15:  # 15% over target
            overage = avg_calories - target_calories
            suggestions.append(
                Suggestion(
                    title="Watch Calorie Intake",
                    description=f"Average intake ({avg_calories:.0f} kcal) exceeds target ({target_calories} kcal) by ~{overage:.0f} kcal/day. Review portion sizes or swap high-calorie foods.",
                    category="nutrition",
                    priority="high",
                    action="reduce_calories",
                )
            )
        elif avg_calories < target_calories * 0.85:  # 15% under target
            shortfall = target_calories - avg_calories
            suggestions.append(
                Suggestion(
                    title="Consider Eating More",
                    description=f"Average intake ({avg_calories:.0f} kcal) is {shortfall:.0f} kcal below target. Undereating can slow metabolism; ensure you're meeting your goal.",
                    category="nutrition",
                    priority="medium",
                    action="increase_calories",
                )
            )

    # Carb vs protein balance
    avg_carbs = metrics.get("avg_carbs", 0)
    carb_ratio = avg_carbs / (avg_carbs + avg_protein) if (avg_carbs + avg_protein) > 0 else 0

    if carb_ratio > 0.75 and avg_protein < 30:  # High carbs, low protein
        suggestions.append(
            Suggestion(
                title="Rebalance Macros",
                description=f"Your diet is {carb_ratio*100:.0f}% carbs but only {avg_protein:.0f}g protein. Reduce refined carbs (bread, pasta, sugar) and add protein-rich foods.",
                category="nutrition",
                priority="medium",
            )
        )

    return suggestions


def _get_goal_progress_suggestions(
    db: Session,
    user_id: int,
    goal: UserGoal,
    metrics: dict,
) -> list[Suggestion]:
    """Generate suggestions based on goal progress and pace."""
    suggestions = []

    if not metrics or not goal:
        return suggestions

    # Get weight progression
    weights = db.query(WeightLog).filter(
        WeightLog.user_id == user_id,
    ).order_by(WeightLog.date).all()

    if len(weights) < 2:
        return suggestions

    current_weight = weights[-1].weight
    target_weight = goal.weight_target
    days_remaining = (goal.target_date.date() - date.today()).days

    if days_remaining < 0:
        suggestions.append(
            Suggestion(
                title="Goal Deadline Passed",
                description=f"Your goal deadline ({goal.target_date.date()}) has passed. Consider setting a new goal or extending the current one.",
                category="goal_pace",
                priority="high",
            )
        )
        return suggestions

    # Calculate needed loss and pace
    total_loss = current_weight - target_weight
    loss_needed = max(0, current_weight - target_weight)
    loss_per_day = loss_needed / max(days_remaining, 1)
    loss_per_week = loss_per_day * 7

    # Goal realism check
    # Safe weight loss: 0.5-1 kg/week
    if loss_per_week > 1.5:
        suggestions.append(
            Suggestion(
                title="Goal May Be Aggressive",
                description=f"To reach {target_weight}kg by {goal.target_date.date()}, you'd need to lose {loss_per_week:.1f}kg/week. Safe rate is 0.5-1kg/week; consider extending the deadline.",
                category="goal_pace",
                priority="high",
            )
        )
    elif loss_needed > 0 and loss_per_week > 0.5:
        suggestions.append(
            Suggestion(
                title="Goal Pace is Realistic",
                description=f"Your goal requires {loss_per_week:.1f}kg/week loss—within the safe 0.5-1kg/week range. You're on a healthy trajectory.",
                category="goal_pace",
                priority="low",
            )
        )

    # Milestone encouragement
    if total_loss > 2:
        suggestions.append(
            Suggestion(
                title=f"Great Progress! {total_loss:.1f}kg Lost",
                description="You're making real progress toward your goal. Keep this momentum going!",
                category="goal_pace",
                priority="medium",
            )
        )

    return suggestions


def _get_trend_suggestions(trend: dict, goal: Optional[UserGoal]) -> list[Suggestion]:
    """Generate suggestions based on weight trend analysis."""
    suggestions = []

    trend_direction = trend.get("trend", "stable")

    if trend_direction == "declining":
        suggestions.append(
            Suggestion(
                title="Weight is Decreasing",
                description=trend.get("insight", "Great progress! Keep your current approach consistent."),
                category="goal_pace",
                priority="low",
            )
        )
    elif trend_direction == "increasing":
        suggestions.append(
            Suggestion(
                title="Weight is Increasing",
                description=trend.get("insight", "Gentle redirect: Consider increasing activity or reviewing portions."),
                category="goal_pace",
                priority="high",
            )
        )

    return suggestions


def _get_ai_suggestions(
    user: User,
    goal: UserGoal,
    metrics: dict,
    stats: dict,
    consistency: float,
) -> list[Suggestion]:
    """Generate AI-powered personalized suggestions via Ollama."""
    suggestions = []

    try:
        # Build context for AI
        context = f"""User profile:
- Age: {user.age}, Gender: {user.gender}
- Height: {user.height}cm
- Goal: Reach {goal.weight_target}kg by {goal.target_date.date()}

Recent metrics (past 7 days):
- Avg calories: {metrics.get('avg_calories', 0):.0f} kcal/day
- Avg protein: {metrics.get('avg_protein', 0):.0f}g/day
- Avg carbs: {metrics.get('avg_carbs', 0):.0f}g/day
- Avg fat: {metrics.get('avg_fat', 0):.0f}g/day
- Logging consistency: {consistency:.0f}%
- Days logged: {stats.get('total_days_logged', 0)}

Provide 1-2 specific, actionable suggestions to improve their weight loss progress. Be encouraging and avoid generic advice."""

        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": context,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()

        result = response.json()
        if "response" in result:
            ai_text = result["response"].strip()
            # Parse AI response into actionable suggestions
            # Simple: treat as a single insight suggestion
            if ai_text:
                suggestions.append(
                    Suggestion(
                        title="Personalized Insight",
                        description=ai_text,
                        category="ai_insight",
                        priority="medium",
                    )
                )
    except (Timeout, ConnectionError, RequestException) as e:
        logger.debug(f"Ollama API unavailable for AI suggestions: {e}")
    except Exception as e:
        logger.warning(f"Unexpected error in AI suggestions: {e}")

    return suggestions


def _estimate_protein_target(metrics: dict) -> float:
    """Estimate daily protein target (1.6-2.2g per kg body weight)."""
    avg_weight = metrics.get("avg_weight")
    if avg_weight:
        return avg_weight * 1.8  # Middle of range
    return 100  # Default fallback


def _estimate_calorie_target(goal: UserGoal) -> Optional[int]:
    """
    Estimate daily calorie target based on weight loss goal.

    Formula: (current_weight - target_weight) * 7000 / days_remaining / 7 = deficit_per_day
    Then: TDEE - deficit_per_day = target_calories

    Approximates TDEE as 25 kcal/kg (sedentary to moderately active).
    """
    if not goal:
        return None

    days_remaining = (goal.target_date.date() - date.today()).days
    if days_remaining <= 0:
        return None

    # Conservative: assume 500 kcal deficit per day (0.5kg/week loss)
    # This should be user-specific, but we don't have baseline weight
    return 1800  # Generic default; should be overridden by user input
