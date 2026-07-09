"""
auth_service/tests/test_logout_user.py

Tests for services/auth.py -> logout_user.

logout_user only calls blacklist_token — it never touches Supabase's
users table directly, so these tests mock blacklist_token itself
rather than the query builder.
"""

from unittest.mock import patch

from auth_service.services.auth import logout_user


class TestLogoutUser:
    def test_logout_always_reports_success(self):
        with patch("auth_service.services.auth.blacklist_token") as mock_blacklist:
            result = logout_user("some.jwt.token")

        assert result["success"] is True
        mock_blacklist.assert_called_once_with("some.jwt.token")

    def test_logout_with_already_expired_token(self):
        """blacklist_token is expected to handle already-expired tokens
        gracefully (e.g. no-op or upsert) — logout_user itself should
        not raise regardless of the token's actual validity."""
        with patch("auth_service.services.auth.blacklist_token"):
            result = logout_user("expired.jwt.token")

        assert result["success"] is True

    def test_logout_with_empty_token_string(self):
        """Edge case: an empty string technically isn't a valid JWT, but
        logout_user shouldn't crash on it — the router layer is
        responsible for ensuring a real token reaches this function."""
        with patch("auth_service.services.auth.blacklist_token") as mock_blacklist:
            result = logout_user("")

        assert result["success"] is True
        mock_blacklist.assert_called_once_with("")