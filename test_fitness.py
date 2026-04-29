"""Tests for fitness calculations."""

import pytest
from app.models.user import User
from app.models.user_goals import UserGoal
from app.services.fitness import (
    calculate_bmi,
    calculate_bmr,
    calculate_tdee,
    calculate_calorie_target,
    calculate_nutritional_targets,
)


@pytest.fixture
def male_user(db_session):
    """Create a test male user."""
    user = User(
        email="male@example.com",
        password_hash="hashed",
        height=180.0,
        age=30,
        gender="male",
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def female_user(db_session):
    """Create a test female user."""
    user = User(
        email="female@example.com",
        password_hash="hashed",
        height=165.0,
        age=28,
        gender="female",
    )
    db_session.add(user)
    db_session.commit()
    return user


class TestBMICalculation:
    def test_bmi_calculation_valid_weight(self):
        bmi = calculate_bmi(height_cm=180, weight_kg=80)
        assert abs(bmi - 24.69) < 0.1

    def test_bmi_calculation_returns_none_for_none_weight(self):
        bmi = calculate_bmi(height_cm=180, weight_kg=None)
        assert bmi is None

    def test_bmi_underweight(self):
        bmi = calculate_bmi(height_cm=170, weight_kg=50)
        assert bmi < 18.5

    def test_bmi_overweight(self):
        bmi = calculate_bmi(height_cm=170, weight_kg=80)
        assert bmi > 25


class TestBMRCalculation:
    def test_bmr_male(self, male_user):
        bmr = calculate_bmr(male_user, weight_kg=80)
        assert 1700 < bmr < 1800

    def test_bmr_female(self, female_user):
        bmr = calculate_bmr(female_user, weight_kg=65)
        assert 1300 < bmr < 1400

    def test_bmr_returns_none_for_none_weight(self, male_user):
        bmr = calculate_bmr(male_user, weight_kg=None)
        assert bmr is None

    def test_bmr_increases_with_weight(self, male_user):
        bmr_80 = calculate_bmr(male_user, weight_kg=80)
        bmr_90 = calculate_bmr(male_user, weight_kg=90)
        assert bmr_90 > bmr_80


class TestTDEECalculation:
    def test_tdee_multiplier(self):
        bmr = 1600
        tdee = calculate_tdee(bmr, activity_multiplier=1.55)
        assert abs(tdee - 2480) < 1

    def test_tdee_default_multiplier(self):
        bmr = 1600
        tdee = calculate_tdee(bmr)
        assert abs(tdee - 2480) < 1


class TestCalorieTarget:
    def test_calorie_target_weight_loss_default(self, male_user):
        target = calculate_calorie_target(male_user, weight_kg=80)
        assert target is not None
        bmr = calculate_bmr(male_user, 80)
        tdee = calculate_tdee(bmr)
        expected = round(tdee - 500, 2)
        assert abs(target - expected) < 1

    def test_calorie_target_weight_loss_with_goal(self, male_user, db_session):
        from datetime import datetime
        weight_kg = 80
        goal_weight = 75
        goal = UserGoal(
            user_id=male_user.id,
            weight_target=goal_weight,
            target_date=datetime(2026, 6, 1),
        )
        db_session.add(goal)
        db_session.commit()

        target = calculate_calorie_target(male_user, weight_kg=weight_kg, goal=goal)
        assert target is not None
        bmr = calculate_bmr(male_user, weight_kg)
        tdee = calculate_tdee(bmr)
        expected = round(tdee - 500, 2)
        assert abs(target - expected) < 1

    def test_calorie_target_weight_gain_with_goal(self, male_user, db_session):
        from datetime import datetime
        weight_kg = 70
        goal_weight = 75
        goal = UserGoal(
            user_id=male_user.id,
            weight_target=goal_weight,
            target_date=datetime(2026, 6, 1),
        )
        db_session.add(goal)
        db_session.commit()

        target = calculate_calorie_target(male_user, weight_kg=weight_kg, goal=goal)
        assert target is not None
        bmr = calculate_bmr(male_user, weight_kg)
        tdee = calculate_tdee(bmr)
        expected = round(tdee + 500, 2)
        assert abs(target - expected) < 1

    def test_calorie_target_returns_none_for_none_weight(self, male_user):
        target = calculate_calorie_target(male_user, weight_kg=None)
        assert target is None


class TestNutritionalTargets:
    def test_nutritional_targets_weight_loss(self, male_user):
        targets = calculate_nutritional_targets(
            male_user,
            current_weight=80,
            goal_weight=75,
        )
        assert targets["daily_calorie_target"] > 0
        assert targets["daily_protein_target"] > 0
        assert targets["daily_water_target"] > 0

    def test_nutritional_targets_weight_gain(self, male_user):
        targets_gain = calculate_nutritional_targets(
            male_user,
            current_weight=70,
            goal_weight=75,
        )
        targets_loss = calculate_nutritional_targets(
            male_user,
            current_weight=75,
            goal_weight=70,
        )
        assert targets_gain["daily_protein_target"] > targets_loss["daily_protein_target"]
        assert targets_gain["daily_calorie_target"] > targets_loss["daily_calorie_target"]

    def test_nutritional_targets_uses_tdee(self, male_user):
        targets = calculate_nutritional_targets(
            male_user,
            current_weight=80,
            goal_weight=75,
        )
        bmr = calculate_bmr(male_user, 80)
        tdee = calculate_tdee(bmr)
        expected_calorie = round(tdee - 500, 2)
        assert abs(targets["daily_calorie_target"] - expected_calorie) < 1

    def test_nutritional_targets_female_fiber(self, female_user):
        targets = calculate_nutritional_targets(female_user, current_weight=65)
        assert targets["daily_fiber_target"] == 25

    def test_nutritional_targets_male_fiber(self, male_user):
        targets = calculate_nutritional_targets(male_user, current_weight=80)
        assert targets["daily_fiber_target"] == 38

    def test_nutritional_targets_returns_empty_for_none_weight(self, male_user):
        targets = calculate_nutritional_targets(male_user, current_weight=None)
        assert targets == {}
