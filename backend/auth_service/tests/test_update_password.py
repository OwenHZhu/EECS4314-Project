"""
auth_service/tests/test_update_password.py
"""

from auth_service.services.auth import update_password
from auth_service.schemas.user import UserUpdatePassword
from auth_service.utils.security import hash_password
from .conftest import make_response


class TestUpdatePassword:
    def test_correct_current_password_succeeds(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("OldPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])
        mock_supabase.table().update().eq().execute.return_value = make_response([{"id": row["id"]}])

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass4567!")
        result = update_password(row["id"], payload)

        assert result["success"] is True

    def test_incorrect_current_password_is_rejected(self, mock_supabase, sample_user_row):
        row = dict(sample_user_row, hashed_password=hash_password("ActualPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])

        payload = UserUpdatePassword(current_password="WrongPass123!", new_password="NewPass4567!")
        result = update_password(row["id"], payload)

        assert result["success"] is False
        assert "incorrect" in result["message"].lower()

    def test_nonexistent_user_returns_not_found(self, mock_supabase):
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([])

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass4567!")
        result = update_password("00000000-0000-0000-0000-000000000000", payload)

        assert result["success"] is False
        assert result["message"] == "User not found"

    def test_update_write_failure_is_reported(self, mock_supabase, sample_user_row):
        """Password check passes, but the write itself fails/returns no rows."""
        row = dict(sample_user_row, hashed_password=hash_password("OldPass123!"))
        mock_supabase.table().select().eq().limit().execute.return_value = make_response([row])
        mock_supabase.table().update().eq().execute.return_value = make_response([])  # update returns nothing

        payload = UserUpdatePassword(current_password="OldPass123!", new_password="NewPass4567!")
        result = update_password(row["id"], payload)

        assert result["success"] is False