from app.models.user import User
from app.models.user_goals import UserGoal


def calculate_bmi(height_cm: float, weight_kg: float | None) -> float | None:
    if not weight_kg:
        return None

    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 2)


def calculate_bmr(user: User, weight_kg: float | None) -> float | None:
    """Basal Metabolic Rate using Mifflin-St Jeor equation"""
    if not weight_kg:
        return None

    gender = user.gender.strip().lower()
    base = (10 * weight_kg) + (6.25 * user.height) - (5 * user.age)

    if gender == "male":
        return base + 5
    if gender == "female":
        return base - 161

    return base - 78


def calculate_tdee(bmr: float, activity_multiplier: float = 1.55) -> float:
    """Total Daily Energy Expenditure (assumes moderately active lifestyle)"""
    return bmr * activity_multiplier


def calculate_calorie_target(user: User, weight_kg: float | None, goal: UserGoal | None = None) -> float | None:
    bmr = calculate_bmr(user, weight_kg)
    if bmr is None:
        return None

    # If goal provided, check if it's weight gain or loss
    if goal and weight_kg:
        is_weight_gain = weight_kg < goal.weight_target
        adjustment = 500 if is_weight_gain else -500
    else:
        # Default to deficit (weight loss)
        adjustment = -500

    return round(bmr + adjustment, 2)


def calculate_nutritional_targets(
    user: User,
    current_weight: float | None,
    goal_weight: float | None = None,
    calorie_target: float | None = None,
) -> dict:
    """
    Calculate comprehensive nutritional targets based on user profile and goals.

    Args:
        user: User object with demographics
        current_weight: Current weight in kg
        goal_weight: Goal weight in kg (optional)
        calorie_target: Override calorie calculation (optional)

    Returns:
        Dict with calculated targets: calories, protein, carbs, fat, water, fiber
    """
    if not current_weight:
        return {}

    # Determine if weight gain or loss goal
    is_weight_gain = goal_weight and current_weight < goal_weight

    # Calculate calorie target if not provided
    if not calorie_target:
        bmr = calculate_bmr(user, current_weight)
        if not bmr:
            return {}
        adjustment = 500 if is_weight_gain else -500
        calorie_target = round(bmr + adjustment, 2)

    # Protein: 1.8-2.2g per kg for muscle building/preservation, 1.2-1.6 for general health
    protein_multiplier = 2.0 if is_weight_gain else 1.6
    protein_target = round(current_weight * protein_multiplier, 1)

    # Macronutrient breakdown (% of calories)
    # Protein: 30%, Carbs: 45%, Fat: 25% (balanced macro split)
    fat_percent = 0.25
    carbs_percent = 0.45
    protein_percent = 0.30

    # Convert to grams
    fat_target = round((calorie_target * fat_percent) / 9, 1)  # 9 cal/g
    carbs_target = round((calorie_target * carbs_percent) / 4, 1)  # 4 cal/g

    # Water: 35ml per kg of body weight + activity adjustment
    # Or 2-3L baseline, increased for active individuals
    water_baseline = 2500  # ml (2.5L baseline)
    water_activity = current_weight * 35  # 35ml per kg
    water_target = round(max(water_baseline, water_activity), -2)  # Round to nearest 100ml

    # Fiber: 25-35g depending on gender and age
    # Women: 25g, Men: 38g (general recommendation)
    gender = user.gender.strip().lower()
    fiber_target = 25 if gender == "female" else 38

    return {
        "daily_calorie_target": int(calorie_target),
        "daily_protein_target": float(protein_target),
        "daily_carbs_target": float(carbs_target),
        "daily_fat_target": float(fat_target),
        "daily_water_target": float(water_target),
        "daily_fiber_target": float(fiber_target),
    }
