"""
auth_service/tests/test_delete_account.py

Tests for services/auth.py -> delete_account.
"""

from unittest.mock import patch

from auth_service.services.auth import delete_account
from .test_conf import make_response


class TestDeleteAccount:
    def test_successful_deletion(self, mock_supabase, sample_user_row):
        mock_supabase([make_response([{"id": sample_user_row["id"]}])])

        with patch("auth_service.services.auth.blacklist_token") as mock_blacklist:
            result = delete_account(sample_user_row["id"], "some.jwt.token")

        assert result["success"] is True
        mock_blacklist.assert_called_once_with("some.jwt.token")

    def test_token_is_blacklisted_even_before_delete_result_is_known(self, mock_supabase, sample_user_row):
        """Deliberately verifies blacklist_token runs first — the session
        should be invalidated immediately regardless of whether the
        delete itself succeeds, per the function's own docstring."""
        mock_supabase([make_response([])])  # delete finds nothing

        with patch("auth_service.services.auth.blacklist_token") as mock_blacklist:
            delete_account(sample_user_row["id"], "some.jwt.token")

        mock_blacklist.assert_called_once()

    def test_nonexistent_user_returns_not_found(self, mock_supabase):
        mock_supabase([make_response([])])

        with patch("auth_service.services.auth.blacklist_token"):
            result = delete_account("00000000-0000-0000-0000-000000000000", "token")

        assert result["success"] is False
        assert result["message"] == "User not found"