"""
auth_service/tests/test_register_user.py

Tests for services/auth.py -> register_user.

register_user makes up to 3 sequential Supabase calls:
    1. check email uniqueness   (select().eq()...)
    2. check username uniqueness (select().eq()...)
    3. insert the new row        (insert()...)

The two "select" checks share the same mocked execute() node (MagicMock
ignores call args), so side_effect with a list handles both in order.
The insert() call is configured separately since it's a different
attribute path on the mock.
"""

from auth_service.services.auth import register_user
from auth_service.schemas.user import UserRegister
from .conftest import make_response


class TestRegisterUser:
    def _valid_user(self):
        return UserRegister(
            username="bookworm1",
            email="reader@example.com",
            password="ValidPass123!",
        )

    def test_successful_registration_returns_token_and_profile(self, mock_supabase):
        mock_supabase.table().select().eq().execute.side_effect = [
            make_response([]),  # email check: not found
            make_response([]),  # username check: not found
        ]
        mock_supabase.table().insert().execute.return_value = make_response([{
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "bookworm1",
            "email": "reader@example.com",
            "bio": None,
            "profile_picture": None,
            "created_at": "2026-01-15T10:30:00",
        }])

        result = register_user(self._valid_user())

        assert result["success"] is True
        assert result["token"] is not None
        assert result["data"].username == "bookworm1"

    def test_duplicate_email_is_rejected(self, mock_supabase, sample_user_row):
        mock_supabase.table().select().eq().execute.return_value = make_response([sample_user_row])

        result = register_user(self._valid_user())

        assert result["success"] is False
        assert "email" in result["message"].lower()
        assert result["token"] is None

    def test_duplicate_username_is_rejected(self, mock_supabase, sample_user_row):
        mock_supabase.table().select().eq().execute.side_effect = [
            make_response([]),               # email check: not found
            make_response([sample_user_row]),  # username check: already exists
        ]

        result = register_user(self._valid_user())

        assert result["success"] is False
        assert "username" in result["message"].lower()

    def test_insert_failure_returns_generic_error(self, mock_supabase):
        """Simulates Supabase returning no rows from the insert itself
        (e.g. a constraint violation not caught by the earlier checks)."""
        mock_supabase.table().select().eq().execute.side_effect = [
            make_response([]),
            make_response([]),
        ]
        mock_supabase.table().insert().execute.return_value = make_response([])  # insert returns nothing

        result = register_user(self._valid_user())

        assert result["success"] is False
        assert result["data"] is None

    def test_password_is_never_returned_in_response(self, mock_supabase):
        mock_supabase.table().select().eq().execute.side_effect = [
            make_response([]),
            make_response([]),
        ]
        mock_supabase.table().insert().execute.return_value = make_response([{
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "bookworm1",
            "email": "reader@example.com",
            "bio": None,
            "profile_picture": None,
            "created_at": "2026-01-15T10:30:00",
        }])

        result = register_user(self._valid_user())

        assert not hasattr(result["data"], "password")
        assert not hasattr(result["data"], "hashed_password")