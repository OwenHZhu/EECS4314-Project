"""
auth_service/tests/test_get_me.py

Tests for services/auth.py -> get_me.
"""

from auth_service.services.auth import get_me
from .test_conf import make_response


class TestGetMe:
    def test_existing_user_returns_profile(self, mock_supabase, sample_user_row):
        mock_supabase([make_response([sample_user_row])])

        result = get_me(sample_user_row["id"])

        assert result["success"] is True
        assert result["data"].username == sample_user_row["username"]

    def test_nonexistent_user_id_returns_not_found(self, mock_supabase):
        mock_supabase([make_response([])])

        result = get_me("00000000-0000-0000-0000-000000000000")

        assert result["success"] is False
        assert result["message"] == "User not found"

    def test_hashed_password_never_appears_in_returned_profile(self, mock_supabase, sample_user_row):
        mock_supabase([make_response([sample_user_row])])

        result = get_me(sample_user_row["id"])

        assert not hasattr(result["data"], "hashed_password")

    def test_malformed_user_id_still_queries_gracefully(self, mock_supabase):
        """get_me doesn't validate UUID format itself — that's the
        router/schema's job upstream. A malformed ID should just come
        back as 'not found' rather than raising an unhandled exception."""
        mock_supabase([make_response([])])

        result = get_me("not-a-real-uuid")

        assert result["success"] is False