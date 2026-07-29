from unittest.mock import MagicMock

from library_service.schemas.library import LibraryEntryCreate, ReadingStatus
from library_service.services.lib_service import add_or_update_library_entry, get_user_library, remove_library_entry, update_library
from library_service.tests.test_conf import make_response, mock_supabase


def test_add_library_entry_success(mock_supabase):
    """Test adding a new book to a user's library."""
    mock_catalogue = MagicMock()
    mock_library = MagicMock()
    mock_catalogue.select.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "book-123"}])
    mock_library.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([])
    mock_library.insert.return_value.execute.return_value = make_response([{"id": "entry-123", "book_id": "book-123", "status": "reading"}])
    mock_supabase.table.side_effect = lambda table_name: mock_catalogue if table_name == "book_catalogue" else mock_library
    entry = LibraryEntryCreate(book_id="book-123", status="reading")

    result = add_or_update_library_entry(entry, "user-123")

    assert result["success"] is True
    assert result["data"]["book_id"] == "book-123"
    mock_library.insert.assert_called_once()


def test_add_library_entry_book_not_found(mock_supabase):
    """Test that a book must exist in the global catalogue."""
    mock_supabase.table().select().eq().limit().execute.return_value = make_response([])
    entry = LibraryEntryCreate(book_id="missing-book", status="wishlist")

    result = add_or_update_library_entry(entry, "user-123")

    assert result["success"] is False
    assert result["message"] == "Book does not exist"


def test_add_existing_library_entry_updates_record(mock_supabase):
    """Test that adding an existing library book updates its record."""
    mock_catalogue = MagicMock()
    mock_library = MagicMock()
    mock_catalogue.select.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "book-123"}])
    mock_library.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "entry-123"}])
    mock_library.update.return_value.eq.return_value.eq.return_value.execute.return_value = make_response([{"id": "entry-123", "status": "read", "rating": 5}])
    mock_supabase.table.side_effect = lambda table_name: mock_catalogue if table_name == "book_catalogue" else mock_library
    entry = LibraryEntryCreate(book_id="book-123", status="read", rating=5)

    result = add_or_update_library_entry(entry, "user-123")

    assert result["success"] is True
    assert result["data"]["status"] == "read"
    mock_library.update.assert_called_once()


def test_get_user_library_success(mock_supabase):
    """Test retrieving all entries for one user."""
    library_rows = [{"id": "entry-123", "user_id": "user-123", "book_id": "book-123"}]
    mock_supabase.table().select().eq().execute.return_value = make_response(library_rows)

    result = get_user_library("user-123")

    assert result["success"] is True
    assert result["data"] == library_rows
    mock_supabase.table.assert_called_with("library")


def test_update_library_success(mock_supabase):
    """Test updating status, favourite, and rating fields."""
    updated_row = {"id": "entry-123", "status": "read", "is_favourite": True, "rating": 5}
    mock_supabase.table().update().eq().eq().execute.return_value = make_response([updated_row])

    result = update_library("user-123", "book-123", ReadingStatus.READ, True, 5)

    assert result["success"] is True
    assert result["data"] == updated_row
    update_data = mock_supabase.table().update.call_args.args[0]
    assert update_data["status"] == "read"
    assert update_data["is_favourite"] is True
    assert update_data["rating"] == 5


def test_update_library_no_data():
    """Test that an update request must contain at least one field."""
    result = update_library("user-123", "book-123")

    assert result["success"] is False
    assert result["message"] == "No update data provided"


def test_update_library_not_found(mock_supabase):
    """Test updating a library entry that does not exist."""
    mock_supabase.table().update().eq().eq().execute.return_value = make_response([])

    result = update_library("user-123", "missing-book", ReadingStatus.READING)

    assert result["success"] is False
    assert result["message"] == "Library entry not found"


def test_remove_library_entry_success(mock_supabase):
    """Test removing a book from a user's library."""
    deleted_row = {"id": "entry-123", "book_id": "book-123"}
    mock_supabase.table().delete().eq().eq().execute.return_value = make_response([deleted_row])

    result = remove_library_entry("user-123", "book-123")

    assert result["success"] is True
    assert result["data"] == deleted_row


def test_remove_library_entry_not_found(mock_supabase):
    """Test removing a library entry that does not exist."""
    mock_supabase.table().delete().eq().eq().execute.return_value = make_response([])

    result = remove_library_entry("user-123", "missing-book")

    assert result["success"] is False
    assert result["message"] == "Library entry not found"
