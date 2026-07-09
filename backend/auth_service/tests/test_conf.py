"""
auth_service/tests/test_conf.py

Shared pytest fixtures for the Auth Service test suite.

The Supabase client is never called for real in tests. We swap it out
for a MagicMock, which automatically handles chained calls like:

    supabase.table("users").select("*").eq("email", x).execute()

A MagicMock returns another MagicMock for every attribute/method call
by default, so the whole chain "just works" without us having to
hand-write .table(), .select(), .eq(), etc. We only need to set what
.execute() should return for each test.
"""

from unittest.mock import MagicMock
from types import SimpleNamespace
import pytest


def make_response(data):
    """Shorthand for building a fake Supabase response object.

    Supabase responses are objects with a `.data` attribute, so tests
    just need to say what `.data` should contain — e.g. an empty list
    for "not found", or a list with one row for "found"."""
    return SimpleNamespace(data=data)


@pytest.fixture
def mock_supabase(monkeypatch):
    """
    Returns a MagicMock standing in for the Supabase client, already
    patched into services/auth.py.

    Usage in a test — configure what .execute() returns, in the order
    the function under test calls it. If a function makes two DB calls
    (e.g. check uniqueness, then insert), use side_effect with a list:

        def test_something(mock_supabase):
            mock_supabase.table().select().eq().execute.return_value = make_response([])
            result = register_user(...)

        # or, for multiple sequential calls:
        def test_something_else(mock_supabase):
            mock_supabase.table().execute.side_effect = [
                make_response([]),                 # 1st call
                make_response([{"id": "abc123"}]),  # 2nd call
            ]
    """

    mock = MagicMock()
    monkeypatch.setattr("auth_service.services.auth.supabase", mock)
    return mock


@pytest.fixture
def sample_user_row():
    """A realistic Supabase row for an existing user, reused across tests."""
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "bookworm1",
        "email": "reader@example.com",
        "hashed_password": "$2b$12$fakehashvalueforfakehashvalueforfake",
        "bio": "I love fantasy novels",
        "profile_picture": None,
        "created_at": "2026-01-15T10:30:00",
    }