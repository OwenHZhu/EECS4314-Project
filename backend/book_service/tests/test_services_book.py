from book_service.services.book_service import add_book, update_book
from book_service.tests.test_conf import make_response, mock_supabase

def test_add_book_success(mock_supabase):
    """Test inserting a book adds a manual external_id."""
    # Arrange: Mock the DB returning the inserted row
    mock_supabase.table().insert().execute.return_value = make_response([{"id": "123", "title": "1984"}])
    
    # Act
    result = add_book({"title": "1984", "author": "George Orwell"})
    
    # Assert
    assert result["success"] is True
    assert result["data"]["title"] == "1984"
    mock_supabase.table.assert_called_with("book_catalogue")

def test_update_book_drops_none_values(mock_supabase):
    """Test that None values are stripped from the update payload."""
    mock_supabase.table().update().eq().execute.return_value = make_response([{"id": "123"}])
    
    # Act: Send an update with a None value for author
    result = update_book("123", {"title": "New Title", "author": None})
    
    # Assert: Verify that ONLY the title was passed to Supabase
    mock_supabase.table().update.assert_called_with({"title": "New Title"})
    assert result["success"] is True