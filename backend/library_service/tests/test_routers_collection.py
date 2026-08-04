from unittest.mock import MagicMock

from library_service.tests.test_conf import client


def test_create_collection_route_success(client, monkeypatch):
    """Test creating a collection through the protected route."""
    created_row = {"id": "collection-123", "user_id": "user-123", "name": "Favourites"}
    create = MagicMock(return_value={"success": True, "message": "Collection created successfully", "data": created_row})
    monkeypatch.setattr("library_service.routers.collections.create_collection", create)

    response = client.post("/api/v1/collections", json={"name": "Favourites", "description": None})

    assert response.status_code == 200
    assert response.json() == created_row
    assert create.call_args.args[1] == "user-123"


def test_create_collection_route_invalid_name(client):
    """Test request validation for an empty collection name."""
    response = client.post("/api/v1/collections", json={"name": ""})

    assert response.status_code == 422


def test_get_collections_route_success(client, monkeypatch):
    """Test retrieving the authenticated user's collections."""
    rows = [{"id": "collection-123", "user_id": "user-123", "name": "Favourites"}]
    get_all = MagicMock(return_value={"success": True, "message": "Collections retrieved successfully", "data": rows})
    monkeypatch.setattr("library_service.routers.collections.get_user_collections", get_all)

    response = client.get("/api/v1/collections")

    assert response.status_code == 200
    assert response.json() == rows
    get_all.assert_called_once_with("user-123")


def test_get_collection_route_success(client, monkeypatch):
    """Test retrieving one owned collection."""
    row = {"id": "collection-123", "user_id": "user-123", "name": "Favourites", "collection_books": []}
    get_one = MagicMock(return_value={"success": True, "message": "Collection retrieved successfully", "data": row})
    monkeypatch.setattr("library_service.routers.collections.get_collection", get_one)

    response = client.get("/api/v1/collections/collection-123")

    assert response.status_code == 200
    assert response.json() == row
    get_one.assert_called_once_with("collection-123", "user-123")


def test_get_collection_route_not_found(client, monkeypatch):
    """Test retrieving a missing or unowned collection."""
    get_one = MagicMock(return_value={"success": False, "message": "Collection not found", "data": None})
    monkeypatch.setattr("library_service.routers.collections.get_collection", get_one)

    response = client.get("/api/v1/collections/missing-collection")

    assert response.status_code == 404
    assert response.json()["detail"] == "Collection not found"


def test_update_collection_route_success(client, monkeypatch):
    """Test updating an owned collection through the route."""
    updated_row = {"id": "collection-123", "name": "Updated"}
    update = MagicMock(return_value={"success": True, "message": "Collection updated successfully", "data": updated_row})
    monkeypatch.setattr("library_service.routers.collections.update_collection", update)

    response = client.patch("/api/v1/collections/collection-123", json={"name": "Updated"})

    assert response.status_code == 200
    assert response.json() == updated_row
    assert update.call_args.args[0] == "collection-123"
    assert update.call_args.args[2] == "user-123"


def test_update_collection_route_no_data(client, monkeypatch):
    """Test that an empty update returns HTTP 400."""
    update = MagicMock(return_value={"success": False, "message": "No update data provided", "data": None})
    monkeypatch.setattr("library_service.routers.collections.update_collection", update)

    response = client.patch("/api/v1/collections/collection-123", json={})

    assert response.status_code == 400
    assert response.json()["detail"] == "No update data provided"


def test_delete_collection_route_success(client, monkeypatch):
    """Test deleting an owned collection through the route."""
    deleted_row = {"id": "collection-123", "user_id": "user-123"}
    delete = MagicMock(return_value={"success": True, "message": "Collection deleted successfully", "data": deleted_row})
    monkeypatch.setattr("library_service.routers.collections.delete_collection", delete)

    response = client.delete("/api/v1/collections/collection-123")

    assert response.status_code == 200
    assert response.json() == deleted_row
    delete.assert_called_once_with("collection-123", "user-123")


def test_add_collection_book_route_success(client, monkeypatch):
    """Test adding a library book to a collection through the route."""
    row = {"collection_id": "collection-123", "book_id": "book-123"}
    add_book = MagicMock(return_value={"success": True, "message": "Book added successfully", "data": row})
    monkeypatch.setattr("library_service.routers.collections.add_book_to_collection", add_book)

    response = client.post("/api/v1/collections/collection-123/books/book-123")

    assert response.status_code == 200
    assert response.json() == row
    add_book.assert_called_once_with("collection-123", "book-123", "user-123")


def test_add_collection_book_route_duplicate(client, monkeypatch):
    """Test that adding a duplicate collection book returns HTTP 409."""
    add_book = MagicMock(return_value={"success": False, "message": "Book is already in this collection", "data": None})
    monkeypatch.setattr("library_service.routers.collections.add_book_to_collection", add_book)

    response = client.post("/api/v1/collections/collection-123/books/book-123")

    assert response.status_code == 409
    assert response.json()["detail"] == "Book is already in this collection"


def test_remove_collection_book_route_success(client, monkeypatch):
    """Test removing a book from a collection through the route."""
    row = {"collection_id": "collection-123", "book_id": "book-123"}
    remove_book = MagicMock(return_value={"success": True, "message": "Book removed successfully", "data": row})
    monkeypatch.setattr("library_service.routers.collections.remove_book_from_collection", remove_book)

    response = client.delete("/api/v1/collections/collection-123/books/book-123")

    assert response.status_code == 200
    assert response.json() == row
    remove_book.assert_called_once_with("collection-123", "book-123", "user-123")


def test_remove_collection_book_route_not_found(client, monkeypatch):
    """Test removing a missing book relationship returns HTTP 404."""
    remove_book = MagicMock(return_value={"success": False, "message": "Book is not in this collection", "data": None})
    monkeypatch.setattr("library_service.routers.collections.remove_book_from_collection", remove_book)

    response = client.delete("/api/v1/collections/collection-123/books/book-123")

    assert response.status_code == 404
    assert response.json()["detail"] == "Book is not in this collection"
