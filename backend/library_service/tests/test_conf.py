import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from types import SimpleNamespace

from auth_service.utils.jwt import get_current_user_id
from library_service.library_service import app


def make_response(data):
    """Helper to simulate Supabase responses."""
    return SimpleNamespace(data=data)


@pytest.fixture
def mock_supabase(monkeypatch):
    """Mocks the Supabase client used in the library service."""
    mock = MagicMock()
    monkeypatch.setattr("library_service.services.lib_service.supabase", mock)
    return mock


@pytest.fixture
def mock_collection_supabase(monkeypatch):
    """Mocks the Supabase client used in the collection service."""
    mock = MagicMock()
    monkeypatch.setattr("library_service.services.collection_service.supabase", mock)
    return mock


@pytest.fixture
def client():
    """Creates a test client with an authenticated user dependency."""
    app.dependency_overrides[get_current_user_id] = lambda: "user-123"
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
