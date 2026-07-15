from book_service.services.book_service import add_book, update_book
from book_service.tests.test_conf import make_response, mock_supabase
from book_service.services.book_service import _calculate_library_stats
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


def test_calculate_library_stats_empty():
    """Test that the math helper safely handles a book with zero library data."""
    result = _calculate_library_stats([])
    
    assert result["wishlist_count"] == 0
    assert result["reading_count"] == 0
    assert result["ratings"]["average"] == 0.0
    assert result["ratings"]["total_ratings"] == 0
    assert result["ratings"]["distribution"]["5"]["count"] == 0

def test_calculate_library_stats_with_data():
    """Test that the math helper correctly calculates averages, percentages, and counts."""
    mock_library_data = [
        {"status": "wishlist", "rating": None},
        {"status": "reading", "rating": None},
        {"status": "reading", "rating": None},
        {"status": "read", "rating": 5},
        {"status": "favourite", "rating": 4},
        {"status": "read", "rating": 4},
        {"status": "dropped", "rating": 1} # User didn't like it!
    ]
    
    result = _calculate_library_stats(mock_library_data)
    
    # Check Status Counts
    assert result["wishlist_count"] == 1
    assert result["reading_count"] == 2
    
    # Check Rating Aggregations
    assert result["ratings"]["total_ratings"] == 4  # Only 4 users left a rating
    assert result["ratings"]["average"] == 3.5      # (5+4+4+1) / 4 = 14 / 4 = 3.5
    
    # Check Distributions
    assert result["ratings"]["distribution"]["5"]["count"] == 1
    assert result["ratings"]["distribution"]["5"]["percentage"] == 25.0
    
    assert result["ratings"]["distribution"]["4"]["count"] == 2
    assert result["ratings"]["distribution"]["4"]["percentage"] == 50.0
    
    assert result["ratings"]["distribution"]["1"]["count"] == 1
    assert result["ratings"]["distribution"]["1"]["percentage"] == 25.0