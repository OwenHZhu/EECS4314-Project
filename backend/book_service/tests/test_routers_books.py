from fastapi.testclient import TestClient
from book_service.book_service import app
from book_service.tests.test_conf import make_response, mock_supabase
from unittest.mock import MagicMock

client = TestClient(app)

def test_get_book_by_id_with_ratings(mock_supabase):
    """Test fetching a book and its aggregated library stats."""
    
    # 1. Create a mock chain specifically for the book_catalogue data table
    mock_book_chain = MagicMock()
    mock_book_chain.select.return_value.eq.return_value.execute.return_value = make_response([
        {"id": "6d896779-7fed-4ef3-a318-2784451571ec", "title": "Pride and Prejudice", "author": "Jane Austen"}
    ])

    # 2. Create a separate mock chain specifically for the library data table
    mock_library_chain = MagicMock()
    # Mocking the new, cleaner chain: .select("rating, status").eq("book_id", id).execute()
    mock_library_chain.select.return_value.eq.return_value.execute.return_value = make_response([
        {"status": "read", "rating": 5}, 
        {"status": "read", "rating": 4}, 
        {"status": "reading", "rating": 4},
        {"status": "wishlist", "rating": None}
    ])

    # 3. Define a router function to intercept the supabase.table() call
    def mock_table_router(table_name):
        if table_name == "book_catalogue":
            return mock_book_chain
        if table_name == "library":
            return mock_library_chain
        return MagicMock()

    # Apply the router to the mock
    mock_supabase.table.side_effect = mock_table_router

    # Act
    fake_uuid = "6d896779-7fed-4ef3-a318-2784451571ec"
    response = client.get(f"/api/v1/books/{fake_uuid}")
    
    # Assert
    assert response.status_code == 200
    data = response.json()["data"]
    
    # Verify core book data is still there
    assert data["title"] == "Pride and Prejudice"
    
    # Verify the new library_stats block!
    assert "library_stats" in data
    assert data["library_stats"]["wishlist_count"] == 1
    assert data["library_stats"]["reading_count"] == 1
    assert data["library_stats"]["ratings"]["total_ratings"] == 3
    assert data["library_stats"]["ratings"]["average"] == 4.33
    assert data["library_stats"]["ratings"]["distribution"]["5"]["count"] == 1
    assert data["library_stats"]["ratings"]["distribution"]["4"]["count"] == 2

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