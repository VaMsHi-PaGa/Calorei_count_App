"""Tests for Pydantic schema validation."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    UserCreate,
    LoginPayload,
    SignupPayload,
    PasswordResetConfirm,
    FoodLogCreate,
    WeightLogCreate,
)


class TestLoginPayload:
    def test_valid_login_payload(self):
        payload = LoginPayload(email="test@example.com", password="password123")
        assert payload.email == "test@example.com"
        assert payload.password == "password123"

    def test_login_rejects_invalid_email(self):
        with pytest.raises(ValidationError):
            LoginPayload(email="not-an-email", password="password123")

    def test_login_rejects_empty_email(self):
        with pytest.raises(ValidationError):
            LoginPayload(email="", password="password123")

    def test_login_rejects_empty_password(self):
        with pytest.raises(ValidationError):
            LoginPayload(email="test@example.com", password="")

    def test_login_rejects_missing_email(self):
        with pytest.raises(ValidationError):
            LoginPayload(password="password123")

    def test_login_rejects_missing_password(self):
        with pytest.raises(ValidationError):
            LoginPayload(email="test@example.com")


class TestSignupPayload:
    def test_valid_signup_payload(self):
        payload = SignupPayload(
            email="test@example.com",
            password="password123",
            height=180.0,
            age=30,
            gender="male",
        )
        assert payload.email == "test@example.com"
        assert payload.password == "password123"

    def test_signup_requires_minimum_password_length(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="test@example.com",
                password="short",
                height=180.0,
                age=30,
                gender="male",
            )

    def test_signup_requires_valid_email(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="not-an-email",
                password="password123",
                height=180.0,
                age=30,
                gender="male",
            )

    def test_signup_requires_positive_height(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="test@example.com",
                password="password123",
                height=-180.0,
                age=30,
                gender="male",
            )

    def test_signup_requires_positive_age(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="test@example.com",
                password="password123",
                height=180.0,
                age=0,
                gender="male",
            )

    def test_signup_rejects_unrealistic_height(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="test@example.com",
                password="password123",
                height=500.0,
                age=30,
                gender="male",
            )

    def test_signup_rejects_unrealistic_age(self):
        with pytest.raises(ValidationError):
            SignupPayload(
                email="test@example.com",
                password="password123",
                height=180.0,
                age=200,
                gender="male",
            )


class TestPasswordResetConfirm:
    def test_valid_reset_payload(self):
        payload = PasswordResetConfirm(token="reset-token-123", new_password="newpassword123")
        assert payload.token == "reset-token-123"
        assert payload.new_password == "newpassword123"

    def test_reset_requires_minimum_password_length(self):
        with pytest.raises(ValidationError):
            PasswordResetConfirm(token="reset-token-123", new_password="short")

    def test_reset_requires_token(self):
        with pytest.raises(ValidationError):
            PasswordResetConfirm(new_password="newpassword123")

    def test_reset_requires_new_password(self):
        with pytest.raises(ValidationError):
            PasswordResetConfirm(token="reset-token-123")


class TestFoodLogCreate:
    def test_valid_food_log(self):
        log = FoodLogCreate(
            food_text="Chicken breast 100g",
            calories=165.0,
            protein=31.0,
            carbs=0.0,
            fat=3.6,
        )
        assert log.food_text == "Chicken breast 100g"
        assert log.calories == 165.0

    def test_food_log_requires_food_text(self):
        with pytest.raises(ValidationError):
            FoodLogCreate(
                food_text="",
                calories=165.0,
            )

    def test_food_log_allows_none_macros(self):
        log = FoodLogCreate(food_text="Chicken breast 100g")
        assert log.calories is None
        assert log.protein is None

    def test_food_log_rejects_negative_calories(self):
        with pytest.raises(ValidationError):
            FoodLogCreate(
                food_text="Chicken breast 100g",
                calories=-100.0,
            )

    def test_food_log_rejects_negative_protein(self):
        with pytest.raises(ValidationError):
            FoodLogCreate(
                food_text="Chicken breast 100g",
                protein=-10.0,
            )


class TestWeightLogCreate:
    def test_valid_weight_log(self):
        log = WeightLogCreate(weight=80.5)
        assert log.weight == 80.5
        assert log.date is None

    def test_weight_log_requires_positive_weight(self):
        with pytest.raises(ValidationError):
            WeightLogCreate(weight=0)

    def test_weight_log_rejects_negative_weight(self):
        with pytest.raises(ValidationError):
            WeightLogCreate(weight=-80.0)

    def test_weight_log_allows_optional_date(self):
        from datetime import date
        log = WeightLogCreate(weight=80.5, date=date.today())
        assert log.weight == 80.5
        assert log.date is not None
