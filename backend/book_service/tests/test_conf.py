import pytest
from unittest.mock import MagicMock
from types import SimpleNamespace

def make_response(data):
    """Helper to simulate Supabase responses."""
    return SimpleNamespace(data=data)

@pytest.fixture
def mock_supabase(monkeypatch):
    """Mocks the Supabase client used in the book service."""
    mock = MagicMock()
    monkeypatch.setattr("book_service.services.book_service.supabase", mock)
    return mock