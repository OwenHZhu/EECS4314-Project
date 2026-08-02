from unittest.mock import MagicMock

from library_service.tests.test_conf import client


def test_get_library_route_success(client, monkeypatch):
    """Test retrieving the authenticated user's library."""
    library_rows = [{"id": "entry-123", "book_id": "book-123", "status": "reading"}]
    get_library = MagicMock(return_value={"success": True, "message": "Library retrieved successfully", "data": library_rows})
    monkeypatch.setattr("library_service.routers.lib.get_user_library", get_library)

    response = client.get("/api/v1/library")

    assert response.status_code == 200
    assert response.json() == library_rows
    get_library.assert_called_once_with("user-123")


def test_add_library_route_success(client, monkeypatch):
    """Test adding a valid entry through the library route."""
    added_row = {"id": "entry-123", "book_id": "book-123", "status": "wishlist"}
    add_entry = MagicMock(return_value={"success": True, "message": "Book added successfully", "data": added_row})
    monkeypatch.setattr("library_service.routers.lib.add_or_update_library_entry", add_entry)

    response = client.post("/api/v1/library", json={"book_id": "book-123", "status": "wishlist", "is_favourite": False, "rating": None})

    assert response.status_code == 200
    assert response.json() == added_row
    assert add_entry.call_args.args[1] == "user-123"


def test_add_library_route_invalid_rating(client):
    """Test that request validation rejects ratings above five."""
    response = client.post("/api/v1/library", json={"book_id": "book-123", "status": "read", "rating": 6})

    assert response.status_code == 422


def test_update_library_route_success(client, monkeypatch):
    """Test updating an entry through the library route."""
    updated_row = {"id": "entry-123", "book_id": "book-123", "status": "read", "rating": 4}
    update_entry = MagicMock(return_value={"success": True, "message": "Library entry updated successfully", "data": updated_row})
    monkeypatch.setattr("library_service.routers.lib.update_library", update_entry)

    response = client.patch("/api/v1/library/update", json={"book_id": "book-123", "status": "read", "rating": 4})

    assert response.status_code == 200
    assert response.json() == updated_row
    assert update_entry.call_args.kwargs["user_id"] == "user-123"
    assert update_entry.call_args.kwargs["book_id"] == "book-123"


def test_delete_library_route_success(client, monkeypatch):
    """Test deleting an entry through the library route."""
    deleted_row = {"id": "entry-123", "book_id": "book-123"}
    remove_entry = MagicMock(return_value={"success": True, "message": "Book removed successfully", "data": deleted_row})
    monkeypatch.setattr("library_service.routers.lib.remove_library_entry", remove_entry)

    response = client.delete("/api/v1/library/book-123")

    assert response.status_code == 200
    assert response.json() == deleted_row
    remove_entry.assert_called_once_with("user-123", "book-123")


def test_delete_library_route_not_found(client, monkeypatch):
    """Test deleting an entry that does not exist."""
    remove_entry = MagicMock(return_value={"success": False, "message": "Library entry not found", "data": None})
    monkeypatch.setattr("library_service.routers.lib.remove_library_entry", remove_entry)

    response = client.delete("/api/v1/library/missing-book")

    assert response.status_code == 404
    assert response.json()["detail"] == "Library entry not found"
