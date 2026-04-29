"""Tests for authentication service and routes."""

import pytest
from datetime import timedelta, timezone, datetime

from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_reset_token,
)


class TestPasswordHashing:
    def test_hash_password_creates_bcrypt_hash(self):
        password = "test-password-123"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 20

    def test_verify_password_matches(self):
        password = "test-password-123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_rejects_wrong_password(self):
        password = "test-password-123"
        hashed = hash_password(password)
        assert verify_password("wrong-password", hashed) is False

    def test_verify_password_handles_invalid_hash(self):
        assert verify_password("password", "invalid-hash-format") is False


class TestTokenGeneration:
    def test_create_access_token_returns_jwt_string(self):
        token = create_access_token(user_id=1)
        assert isinstance(token, str)
        assert len(token) > 20

    def test_create_refresh_token_returns_jwt_string(self):
        token = create_refresh_token(user_id=1)
        assert isinstance(token, str)
        assert len(token) > 20

    def test_tokens_are_different(self):
        access_token = create_access_token(user_id=1)
        refresh_token = create_refresh_token(user_id=1)
        assert access_token != refresh_token


class TestTokenVerification:
    def test_verify_access_token_returns_user_id(self):
        user_id = 42
        token = create_access_token(user_id=user_id)
        verified_id = verify_token(token, token_type="access")
        assert verified_id == user_id

    def test_verify_refresh_token_returns_user_id(self):
        user_id = 42
        token = create_refresh_token(user_id=user_id)
        verified_id = verify_token(token, token_type="refresh")
        assert verified_id == user_id

    def test_verify_token_rejects_wrong_type(self):
        token = create_access_token(user_id=1)
        result = verify_token(token, token_type="refresh")
        assert result is None

    def test_verify_token_rejects_invalid_token(self):
        result = verify_token("invalid-token", token_type="access")
        assert result is None


class TestResetToken:
    def test_generate_reset_token_returns_string(self):
        token = generate_reset_token()
        assert isinstance(token, str)
        assert len(token) > 20

    def test_generate_reset_token_unique(self):
        token1 = generate_reset_token()
        token2 = generate_reset_token()
        assert token1 != token2


class TestAuthRoutes:
    def test_signup_creates_user(self, client):
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "last_name": "Doe",
            "height": 180.0,
            "age": 30,
            "gender": "male",
        }
        response = client.post("/auth/signup", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["access_token"]
        assert data["refresh_token"]
        assert data["user"]["email"] == "test@example.com"

    def test_signup_rejects_duplicate_email(self, client):
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "height": 180.0,
            "age": 30,
            "gender": "male",
        }
        client.post("/auth/signup", json=payload)
        response = client.post("/auth/signup", json=payload)
        assert response.status_code == 409

    def test_login_returns_tokens(self, client):
        signup_payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "height": 180.0,
            "age": 30,
            "gender": "male",
        }
        client.post("/auth/signup", json=signup_payload)

        login_payload = {
            "email": "test@example.com",
            "password": "password123",
        }
        response = client.post("/auth/login", json=login_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"]
        assert data["refresh_token"]

    def test_login_rejects_invalid_password(self, client):
        signup_payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "height": 180.0,
            "age": 30,
            "gender": "male",
        }
        client.post("/auth/signup", json=signup_payload)

        login_payload = {
            "email": "test@example.com",
            "password": "wrong-password",
        }
        response = client.post("/auth/login", json=login_payload)
        assert response.status_code == 401

    def test_refresh_token_generates_new_access_token(self, client):
        signup_payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "John",
            "height": 180.0,
            "age": 30,
            "gender": "male",
        }
        signup_response = client.post("/auth/signup", json=signup_payload)
        refresh_token = signup_response.json()["refresh_token"]

        refresh_payload = {"refresh_token": refresh_token}
        response = client.post("/auth/refresh", json=refresh_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"]
        assert data["refresh_token"]

    def test_login_validates_empty_email(self, client):
        response = client.post("/auth/login", json={"email": "", "password": "password123"})
        assert response.status_code == 422

    def test_login_validates_invalid_email_format(self, client):
        response = client.post("/auth/login", json={"email": "not-an-email", "password": "password123"})
        assert response.status_code == 422
