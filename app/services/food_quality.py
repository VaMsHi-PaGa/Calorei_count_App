"""
Food quality analysis service for identifying problematic foods.

Analyzes foods based on:
- Caloric density (calories per gram)
- Macronutrient ratios (refined carbs vs protein/fiber)
- Nutritional value heuristics
- AI-powered analysis via Ollama (optional)
"""

from datetime import date, datetime
import logging
from typing import Optional
from sqlalchemy.orm import Session
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError

from app.models import FoodLog

logger = logging.getLogger(__name__)

# Ollama configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"
OLLAMA_TIMEOUT = 10  # seconds


class FoodQualityScore:
    """Represents nutritional quality assessment of a food."""

    def __init__(
        self,
        food_text: str,
        quality_score: float,
        concerns: list[str],
        category: str,
        reasons: list[str],
    ):
        """
        Args:
            food_text: Name of the food
            quality_score: 0-100, higher = better quality
            concerns: List of identified issues (e.g., "high-calorie", "refined-carbs")
            category: Food category (Protein, Vegetable, Fruit, Grain, Processed, Dairy, Other)
            reasons: Human-readable explanations of the score
        """
        self.food_text = food_text
        self.quality_score = round(quality_score, 1)
        self.concerns = concerns
        self.category = category
        self.reasons = reasons
        self.is_problematic = quality_score < 40  # Arbitrary threshold

    def __repr__(self) -> str:
        return f"<FoodQualityScore({self.food_text}, score={self.quality_score}, concerns={self.concerns})>"


def analyze_food_quality(
    food_text: str,
    calories: Optional[float] = None,
    protein: Optional[float] = None,
    carbs: Optional[float] = None,
    fat: Optional[float] = None,
    use_ai: bool = False,
) -> FoodQualityScore:
    """
    Analyze nutritional quality of a food using heuristics.

    Uses macro-based rules to identify problematic foods:
    - High caloric density (>2.0 kcal/gram)
    - Refined carbs (high carbs, low protein, classified as processed/grain)
    - Low nutritional value (processed foods, sugary, fried)
    - Unhealthy fat ratios

    If use_ai=True, queries Ollama for additional context (with timeout handling).

    Args:
        food_text: Food name/description
        calories: Total calories
        protein: Protein in grams
        carbs: Carbs in grams
        fat: Fat in grams
        use_ai: Whether to query Ollama for AI analysis

    Returns:
        FoodQualityScore with quality_score (0-100), concerns list, and reasons
    """
    concerns = []
    reasons = []
    quality_score = 80  # Start high, deduct for issues

    # Calculate metrics if data provided
    macro_sum = 0
    if calories and (protein or carbs or fat):
        macro_sum = (protein or 0) + (carbs or 0) + (fat or 0)

    # Rule 1: Caloric density (high = problematic)
    if calories and macro_sum > 0:
        caloric_density = calories / macro_sum if macro_sum > 0 else 0
        if caloric_density > 2.0:
            concerns.append("high-calorie")
            quality_score -= 20
            reasons.append(f"High caloric density: {caloric_density:.1f} kcal/gram")
        elif caloric_density > 1.5:
            quality_score -= 10
            reasons.append(f"Moderate caloric density: {caloric_density:.1f} kcal/gram")

    # Rule 2: Protein insufficiency relative to calories
    if calories and protein:
        protein_ratio = protein / calories if calories > 0 else 0
        if protein_ratio < 0.05:  # <5% of calories from protein
            concerns.append("low-protein")
            quality_score -= 15
            reasons.append(f"Low protein ratio: {protein_ratio*100:.1f}% of calories")

    # Rule 3: Refined carbs detection (high carbs, low protein, processed)
    if carbs and protein:
        carb_ratio = carbs / (carbs + protein) if (carbs + protein) > 0 else 0
        if carb_ratio > 0.8 and protein < 5:  # 80%+ carbs, <5g protein
            concerns.append("refined-carbs")
            quality_score -= 20
            reasons.append(f"High refined carb ratio: {carb_ratio*100:.0f}% carbs, {protein}g protein")

    # Rule 4: Fat quality (saturated fat implied by "fried", "butter", etc.)
    if fat and fat > 20:  # High fat content
        if any(word in food_text.lower() for word in ["fried", "butter", "cream", "oil", "cheese"]):
            concerns.append("high-fat-unhealthy")
            quality_score -= 15
            reasons.append(f"High fat content ({fat}g) with likely saturated sources")

    # Rule 5: Keyword-based heuristics (processed, sugary, etc.)
    problem_keywords = {
        "candy": ("sugary", 25),
        "soda": ("sugary", 25),
        "soft drink": ("sugary", 25),
        "soda pop": ("sugary", 25),
        "donut": ("sugary", 20),
        "cookie": ("sugary", 15),
        "cake": ("sugary", 15),
        "chocolate": ("sugary", 10),  # Milder penalty; some nutritional value
        "chips": ("processed-snack", 20),
        "fast food": ("processed", 25),
        "burger": ("processed", 20),
        "pizza": ("processed", 15),
        "hot dog": ("processed", 15),
        "ice cream": ("sugary-high-fat", 20),
        "soda": ("sugary", 25),
        "energy drink": ("sugary-caffeine", 20),
    }

    food_lower = food_text.lower()
    for keyword, (concern_type, penalty) in problem_keywords.items():
        if keyword in food_lower:
            if concern_type not in concerns:
                concerns.append(concern_type)
            quality_score -= penalty
            reasons.append(f"Identified as {concern_type.replace('-', ' ')} food")
            break  # Only apply highest-priority keyword match

    # Rule 6: Positive markers (vegetables, lean protein, etc.)
    positive_keywords = {
        "broccoli": 15,
        "spinach": 15,
        "salad": 15,
        "vegetable": 10,
        "apple": 10,
        "banana": 10,
        "berries": 15,
        "chicken breast": 15,
        "fish": 15,
        "salmon": 15,
        "egg": 10,
        "yogurt": 10,
        "greek yogurt": 15,
        "oats": 10,
        "brown rice": 10,
        "quinoa": 15,
    }

    for keyword, bonus in positive_keywords.items():
        if keyword in food_lower:
            quality_score += bonus
            reasons.append(f"Positive marker: {keyword}")
            break  # Only apply one positive

    # Clamp score to 0-100
    quality_score = max(0, min(100, quality_score))

    # Estimate category from food text
    category = _estimate_food_category(food_text)

    # Optional AI analysis (with timeout handling)
    if use_ai and concerns:  # Only use AI if there are concerns to analyze
        ai_insight = _get_ollama_analysis(food_text, concerns, reasons)
        if ai_insight:
            reasons.append(f"AI analysis: {ai_insight}")

    return FoodQualityScore(
        food_text=food_text,
        quality_score=quality_score,
        concerns=concerns,
        category=category,
        reasons=reasons,
    )


def get_problematic_foods(
    db: Session,
    user_id: int,
    start_date: date,
    end_date: date,
    threshold: float = 40,
    limit: int = 10,
) -> list[dict]:
    """
    Identify most problematic foods logged by user in date range.

    Returns foods with quality_score < threshold, sorted by frequency × severity.

    Args:
        db: Database session
        user_id: User ID
        start_date: Analysis start date
        end_date: Analysis end date
        threshold: Quality score cutoff (default 40 = problematic)
        limit: Max number of foods to return

    Returns:
        List of dicts with keys:
        - food_text: Food name
        - frequency: How many times logged
        - quality_score: Numeric score (0-100)
        - concerns: List of identified issues
        - impact_rating: "high", "medium", "low" based on frequency × severity
        - sample_entry: Latest food log entry details for context
    """
    # Get all foods logged in period
    food_logs = db.query(FoodLog).filter(
        FoodLog.user_id == user_id,
        FoodLog.created_at >= datetime.combine(start_date, datetime.min.time()),
        FoodLog.created_at <= datetime.combine(end_date, datetime.max.time()),
    ).all()

    if not food_logs:
        return []

    # Analyze each unique food
    food_analysis = {}
    for log in food_logs:
        food_key = log.food_text.lower()

        if food_key not in food_analysis:
            # Analyze this food once
            quality = analyze_food_quality(
                food_text=log.food_text,
                calories=log.calories,
                protein=log.protein,
                carbs=log.carbs,
                fat=log.fat,
            )

            food_analysis[food_key] = {
                "food_text": log.food_text,
                "quality_score": quality.quality_score,
                "concerns": quality.concerns,
                "frequency": 0,
                "latest_entry": log,
            }

        food_analysis[food_key]["frequency"] += 1

    # Filter by threshold and sort by impact (frequency × severity)
    problematic = []
    for food_key, data in food_analysis.items():
        if data["quality_score"] < threshold:
            # Impact rating: how many times × how bad
            severity = (100 - data["quality_score"]) / 100
            impact_score = data["frequency"] * severity

            impact_rating = "low"
            if impact_score > 10:
                impact_rating = "high"
            elif impact_score > 5:
                impact_rating = "medium"

            problematic.append({
                "food_text": data["food_text"],
                "frequency": data["frequency"],
                "quality_score": data["quality_score"],
                "concerns": data["concerns"],
                "impact_rating": impact_rating,
                "latest_entry": {
                    "date": data["latest_entry"].created_at.date(),
                    "calories": data["latest_entry"].calories,
                    "protein": data["latest_entry"].protein,
                    "carbs": data["latest_entry"].carbs,
                    "fat": data["latest_entry"].fat,
                },
            })

    # Sort by impact: high → medium → low, then by frequency descending
    impact_order = {"high": 0, "medium": 1, "low": 2}
    problematic.sort(
        key=lambda x: (impact_order[x["impact_rating"]], -x["frequency"]),
    )

    return problematic[:limit]


def _estimate_food_category(food_text: str) -> str:
    """Simple heuristic to estimate food category from text."""
    food_lower = food_text.lower()

    if any(word in food_lower for word in ["chicken", "beef", "pork", "fish", "salmon", "tuna", "egg", "meat", "steak"]):
        return "Protein"
    if any(word in food_lower for word in ["broccoli", "spinach", "lettuce", "carrot", "vegetable", "salad", "greens"]):
        return "Vegetable"
    if any(word in food_lower for word in ["apple", "banana", "orange", "berry", "fruit", "grape"]):
        return "Fruit"
    if any(word in food_lower for word in ["rice", "pasta", "bread", "cereal", "grain", "oats"]):
        return "Grain"
    if any(word in food_lower for word in ["chips", "candy", "soda", "processed", "fast food", "burger", "pizza"]):
        return "Processed"
    if any(word in food_lower for word in ["milk", "cheese", "yogurt", "butter"]):
        return "Dairy"

    return "Other"


def _get_ollama_analysis(
    food_text: str,
    concerns: list[str],
    reasons: list[str],
) -> Optional[str]:
    """
    Query Ollama for AI-powered food quality analysis.

    Provides additional context and suggestions for improving food quality.
    Handles timeouts gracefully — AI is optional enhancement.

    Args:
        food_text: Food name
        concerns: Identified issues from heuristics
        reasons: Explanation of score

    Returns:
        Short insight string from Ollama, or None if request fails/times out
    """
    try:
        prompt = f"""Briefly analyze the nutritional quality of this food in 1-2 sentences.
Food: {food_text}
Concerns: {', '.join(concerns)}

Only respond with the analysis, no preamble."""

        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=OLLAMA_TIMEOUT,
        )
        response.raise_for_status()

        result = response.json()
        if "response" in result:
            insight = result["response"].strip()
            # Truncate to reasonable length
            if len(insight) > 200:
                insight = insight[:200] + "..."
            return insight
    except (Timeout, ConnectionError, RequestException) as e:
        logger.debug(f"Ollama API unavailable for food quality analysis: {e}")
        return None
    except Exception as e:
        logger.warning(f"Unexpected error in Ollama analysis: {e}")
        return None
