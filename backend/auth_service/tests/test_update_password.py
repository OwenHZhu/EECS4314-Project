"""
auth_service/tests/test_update_password.py

Tests for services/auth.py -> update_password.

Note: UserUpdatePassword's own schema validator (passwords_must_differ,
password strength) is tested separately in test_schemas_user.py — these
tests focus on the service-layer logic that runs AFTER the schema has
already validated the payload.
"""

from auth_service.services.auth import update_password
from auth_service.schemas.user import UserUpdatePassword
from auth_service.utils.security import hash_password
from .test_conf import make_response


class TestUpdatePassword:
    def test_correct_current_password_succeeds(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("OldPass123!"))
        mock_supabase([
            make_response([row]),           # fetch current hash
            make_response([{"id": row["id"]}]),  # update result
        ])

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass456!")
        result = update_password(row["id"], payload)

        assert result["success"] is True

    def test_incorrect_current_password_is_rejected(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("ActualPass123!"))
        mock_supabase([make_response([row])])

        payload = UserUpdatePassword(current_password="WrongPass123!", new_password="NewPass456!")
        result = update_password(row["id"], payload)

        assert result["success"] is False
        assert "incorrect" in result["message"].lower()

    def test_nonexistent_user_returns_not_found(self, mock_supabase):
        mock_supabase([make_response([])])

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass456!")
        result = update_password("00000000-0000-0000-0000-000000000000", payload)

        assert result["success"] is False
        assert result["message"] == "User not found"

    def test_update_write_failure_is_reported(self, mock_supabase, sample_user_row):
        """Password check passes, but the write itself fails/returns no rows."""
        row = dict(sample_user_row, hashed_password=hash_password("OldPass123!"))
        mock_supabase([
            make_response([row]),
            make_response([]),  # update returns nothing
        ])

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass456!")
        result = update_password(row["id"], payload)

        assert result["success"] is False