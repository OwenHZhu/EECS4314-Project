"""
Automated backend tests for BookAtlas authentication routes.

These tests cover:
- POST /api/v1/auth/register
- POST /api/v1/auth/login

The database/auth service layer is mocked so the tests do not create real users
in Supabase.
"""

import sys
from pathlib import Path
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient


# Add backend folder to Python path so imports like "routers.auth" work.
PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))


from book_atlas import app  # noqa: E402
import routers.auth as auth_router  # noqa: E402


client = TestClient(app)


def fake_user_data():
    return {
        "id": "test-user-id-123",
        "username": "testuser1",
        "email": "testuser1@example.com",
        "bio": None,
        "profile_picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def test_register_success(monkeypatch):
    """
    SIGNUP-001 / SIGNUP-011 / SIGNUP-013

    Valid registration should return success, token, and user data.
    """

    def mock_register_user(user):
        return {
            "success": True,
            "message": "Account created successfully",
            "token": "fake-jwt-token",
            "data": fake_user_data(),
        }

    monkeypatch.setattr(auth_router, "register_user", mock_register_user)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Account created successfully"
    assert body["token"] == "fake-jwt-token"
    assert body["data"]["username"] == "testuser1"
    assert body["data"]["email"] == "testuser1@example.com"


def test_register_duplicate_email(monkeypatch):
    """
    SIGNUP-009

    Registering with an existing email should return 409.
    """

    def mock_register_user(user):
        return {
            "success": False,
            "message": "An account with this email already exists",
            "token": None,
            "data": None,
        }

    monkeypatch.setattr(auth_router, "register_user", mock_register_user)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "testuser1@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "An account with this email already exists"


def test_register_duplicate_username(monkeypatch):
    """
    SIGNUP-010

    Registering with an existing username should return 409.
    """

    def mock_register_user(user):
        return {
            "success": False,
            "message": "Username is already taken",
            "token": None,
            "data": None,
        }

    monkeypatch.setattr(auth_router, "register_user", mock_register_user)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser1",
            "email": "newemail@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Username is already taken"


def test_register_missing_required_fields():
    """
    SIGNUP-002 / SIGNUP-003 / SIGNUP-004

    Missing required fields should fail request validation.
    """

    response = client.post(
        "/api/v1/auth/register",
        json={},
    )

    assert response.status_code == 422


def test_register_password_not_returned(monkeypatch):
    """
    SIGNUP-012

    Successful registration response should not expose plain or hashed password.
    """

    def mock_register_user(user):
        return {
            "success": True,
            "message": "Account created successfully",
            "token": "fake-jwt-token",
            "data": fake_user_data(),
        }

    monkeypatch.setattr(auth_router, "register_user", mock_register_user)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "Password123!",
        },
    )

    body_text = response.text.lower()

    assert response.status_code == 200
    assert "Password123!" not in body_text
    assert "hashed_password" not in body_text
    assert "password" not in body_text


def test_login_success(monkeypatch):
    """
    LOGIN-001 / LOGIN-008 / LOGIN-009

    Valid login should return success, token, and user data.
    """

    def mock_login_user(user):
        return {
            "success": True,
            "message": "Logged in successfully",
            "token": "fake-jwt-token",
            "data": fake_user_data(),
        }

    monkeypatch.setattr(auth_router, "login_user", mock_login_user)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser1@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["message"] == "Logged in successfully"
    assert body["token"] == "fake-jwt-token"
    assert body["data"]["email"] == "testuser1@example.com"


def test_login_invalid_credentials_wrong_password(monkeypatch):
    """
    LOGIN-006

    Wrong password should return 401 Invalid credentials.
    """

    def mock_login_user(user):
        return {
            "success": False,
            "message": "Invalid credentials",
            "token": None,
            "data": None,
        }

    monkeypatch.setattr(auth_router, "login_user", mock_login_user)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser1@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_invalid_credentials_non_existing_email(monkeypatch):
    """
    LOGIN-007

    Non-existing email should return the same generic Invalid credentials message.
    """

    def mock_login_user(user):
        return {
            "success": False,
            "message": "Invalid credentials",
            "token": None,
            "data": None,
        }

    monkeypatch.setattr(auth_router, "login_user", mock_login_user)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "doesnotexist@example.com",
            "password": "Password123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_missing_required_fields():
    """
    LOGIN-002 / LOGIN-003 / LOGIN-004

    Missing required fields should fail request validation.
    """

    response = client.post(
        "/api/v1/auth/login",
        json={},
    )

    assert response.status_code == 422


def test_login_password_not_returned(monkeypatch):
    """
    LOGIN-010

    Successful login response should not expose plain or hashed password.
    """

    def mock_login_user(user):
        return {
            "success": True,
            "message": "Logged in successfully",
            "token": "fake-jwt-token",
            "data": fake_user_data(),
        }

    monkeypatch.setattr(auth_router, "login_user", mock_login_user)

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser1@example.com",
            "password": "Password123!",
        },
    )

    body_text = response.text.lower()

    assert response.status_code == 200
    assert "Password123!" not in body_text
    assert "hashed_password" not in body_text
    assert "password" not in body_text