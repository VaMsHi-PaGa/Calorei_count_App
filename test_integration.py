"""Integration tests for auth flow and food/weight logging."""
import pytest
from fastapi.testclient import TestClient

# These tests use the conftest.py fixtures (client, test user, auth headers)

def test_signup_and_login(client: TestClient):
    """Full signup → login → profile fetch flow."""
    # Signup
    resp = client.post("/auth/signup", json={
        "email": "integ@test.com",
        "password": "securepass123",
        "height": 175.0,
        "age": 28,
        "gender": "male",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "integ@test.com"

    # Login
    resp = client.post("/auth/login", json={
        "email": "integ@test.com",
        "password": "securepass123",
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    # Fetch profile
    resp = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "integ@test.com"


def test_food_log_creates_streak(client: TestClient, auth_headers: dict):
    """Logging food should create/update a streak."""
    resp = client.post("/food-log", json={"food_text": "oatmeal"}, headers=auth_headers)
    assert resp.status_code in (200, 201)

    resp = client.get("/api/streaks", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["food_streak"] >= 1


def test_weight_log_creates_streak(client: TestClient, auth_headers: dict):
    """Logging weight should create/update a streak."""
    resp = client.post("/weight-log", json={"weight": 75.5}, headers=auth_headers)
    assert resp.status_code in (200, 201)

    resp = client.get("/api/streaks", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["weight_streak"] >= 1


def test_weekly_summary(client: TestClient, auth_headers: dict):
    resp = client.get("/api/reports/weekly-summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "this_week" in data
    assert "last_week" in data
