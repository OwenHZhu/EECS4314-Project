from fastapi.testclient import TestClient
from book_service.book_service import app
from book_service.tests.test_conf import make_response, mock_supabase

client = TestClient(app)

def test_get_all_books_route(mock_supabase):
    """Test the GET /books/ endpoint."""
    # Arrange: Fake DB response
    mock_supabase.table().select().limit().execute.return_value = make_response([
        {"id": "123", "title": "Dune", "author": "Frank Herbert"}
    ])

    # Act
    response = client.get("/api/v1/books/")
    
    # Assert
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["title"] == "Dune"

def test_delete_book_route_not_found(mock_supabase):
    """Test deleting a book that doesn't exist."""
    # Arrange: Fake DB returning empty list (not found)
    mock_supabase.table().delete().eq().execute.return_value = make_response([])

    # Act
    fake_uuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    response = client.delete(f"/api/v1/books/{fake_uuid}")
    
    # Assert
    print(response.json())
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()