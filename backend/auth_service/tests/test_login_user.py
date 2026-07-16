"""
auth_service/tests/test_login_user.py

Tests for services/auth.py -> login_user.

Security note being tested: "user not found" and "wrong password" must
return the IDENTICAL message, to prevent user-enumeration attacks where
an attacker could otherwise probe which emails are registered.
"""

from auth_service.services.auth import login_user
from auth_service.schemas.user import UserLogin
from auth_service.utils.security import hash_password
from .conftest import make_response


class TestLoginUser:
    def test_successful_login_returns_token(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("CorrectPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])

        result = login_user(UserLogin(email=row["email"], password="CorrectPass123!"))

        assert result["success"] is True
        assert result["token"] is not None
        assert result["data"].email == row["email"]

    def test_nonexistent_email_returns_generic_invalid_credentials(self, mock_supabase):
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([])

        result = login_user(UserLogin(email="nobody@example.com", password="anything"))

        assert result["success"] is False
        assert result["message"] == "Invalid credentials"

    def test_wrong_password_returns_same_generic_message(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("CorrectPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])

        result = login_user(UserLogin(email=row["email"], password="WrongPassword!"))

        assert result["success"] is False
        assert result["message"] == "Invalid credentials"

    def test_enumeration_protection_messages_are_identical(self, mock_supabase, sample_user_row):
        """Explicitly asserts both failure paths produce the exact same
        message string — the core security property of this function."""
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([])
        not_found_result = login_user(UserLogin(email="ghost@example.com", password="x"))

        row = dict(sample_user_row, hashed_password=hash_password("CorrectPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])
        wrong_pw_result = login_user(UserLogin(email=row["email"], password="WrongPass!"))

        assert not_found_result["message"] == wrong_pw_result["message"]