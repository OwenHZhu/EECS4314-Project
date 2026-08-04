from unittest.mock import MagicMock

from library_service.schemas.collection import CollectionCreate, CollectionUpdate
from library_service.services.collection_service import add_book_to_collection, create_collection, delete_collection, get_collection, get_user_collections, remove_book_from_collection, update_collection
from library_service.tests.test_conf import make_response, mock_collection_supabase


def test_create_collection_success(mock_collection_supabase):
    """Test creating a collection for the authenticated user."""
    created_row = {"id": "collection-123", "user_id": "user-123", "name": "Favourites"}
    mock_collection_supabase.table().insert().execute.return_value = make_response([created_row])

    result = create_collection(CollectionCreate(name="  Favourites  "), "user-123")

    assert result["success"] is True
    assert result["data"] == created_row
    insert_data = mock_collection_supabase.table().insert.call_args.args[0]
    assert insert_data["user_id"] == "user-123"
    assert insert_data["name"] == "Favourites"


def test_create_collection_blank_name(mock_collection_supabase):
    """Test that whitespace-only collection names are rejected."""
    result = create_collection(CollectionCreate(name="   "), "user-123")

    assert result["success"] is False
    assert result["message"] == "Collection name cannot be empty"
    mock_collection_supabase.table.assert_not_called()


def test_create_collection_database_failure(mock_collection_supabase):
    """Test failure when Supabase does not return a created collection."""
    mock_collection_supabase.table().insert().execute.return_value = make_response([])

    result = create_collection(CollectionCreate(name="Favourites"), "user-123")

    assert result["success"] is False
    assert result["message"] == "Failed to create collection"


def test_get_user_collections_success(mock_collection_supabase):
    """Test retrieving all collections for one user."""
    rows = [{"id": "collection-123", "user_id": "user-123", "name": "Favourites"}]
    mock_collection_supabase.table().select().eq().order().execute.return_value = make_response(rows)

    result = get_user_collections("user-123")

    assert result["success"] is True
    assert result["data"] == rows
    mock_collection_supabase.table.assert_called_with("collections")


def test_get_collection_success(mock_collection_supabase):
    """Test retrieving one owned collection and its books."""
    row = {"id": "collection-123", "user_id": "user-123", "collection_books": []}
    mock_collection_supabase.table().select().eq().eq().limit().execute.return_value = make_response([row])

    result = get_collection("collection-123", "user-123")

    assert result["success"] is True
    assert result["data"] == row


def test_get_collection_not_found(mock_collection_supabase):
    """Test retrieving a missing or unowned collection."""
    mock_collection_supabase.table().select().eq().eq().limit().execute.return_value = make_response([])

    result = get_collection("missing-collection", "user-123")

    assert result["success"] is False
    assert result["message"] == "Collection not found"


def test_update_collection_success(mock_collection_supabase):
    """Test updating the name and description of an owned collection."""
    updated_row = {"id": "collection-123", "name": "Updated", "description": "Updated description"}
    mock_collection_supabase.table().update().eq().eq().execute.return_value = make_response([updated_row])

    result = update_collection("collection-123", CollectionUpdate(name=" Updated ", description="Updated description"), "user-123")

    assert result["success"] is True
    assert result["data"] == updated_row
    update_data = mock_collection_supabase.table().update.call_args.args[0]
    assert update_data["name"] == "Updated"
    assert update_data["description"] == "Updated description"
    assert "updated_at" in update_data


def test_update_collection_no_data():
    """Test that an update request must contain at least one field."""
    result = update_collection("collection-123", CollectionUpdate(), "user-123")

    assert result["success"] is False
    assert result["message"] == "No update data provided"


def test_update_collection_not_found(mock_collection_supabase):
    """Test updating a missing or unowned collection."""
    mock_collection_supabase.table().update().eq().eq().execute.return_value = make_response([])

    result = update_collection("missing-collection", CollectionUpdate(name="Updated"), "user-123")

    assert result["success"] is False
    assert result["message"] == "Collection not found"


def test_delete_collection_success(mock_collection_supabase):
    """Test deleting an owned collection."""
    deleted_row = {"id": "collection-123", "user_id": "user-123"}
    mock_collection_supabase.table().delete().eq().eq().execute.return_value = make_response([deleted_row])

    result = delete_collection("collection-123", "user-123")

    assert result["success"] is True
    assert result["data"] == deleted_row


def test_delete_collection_not_found(mock_collection_supabase):
    """Test deleting a missing or unowned collection."""
    mock_collection_supabase.table().delete().eq().eq().execute.return_value = make_response([])

    result = delete_collection("missing-collection", "user-123")

    assert result["success"] is False
    assert result["message"] == "Collection not found"


def test_add_book_to_collection_success(mock_collection_supabase):
    """Test adding a user's library book to an owned collection."""
    mock_collections = MagicMock()
    mock_library = MagicMock()
    mock_collection_books = MagicMock()
    mock_collections.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "collection-123"}])
    mock_library.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"book_id": "book-123"}])
    mock_collection_books.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([])
    created_row = {"collection_id": "collection-123", "book_id": "book-123"}
    mock_collection_books.insert.return_value.execute.return_value = make_response([created_row])
    mock_collection_supabase.table.side_effect = lambda name: {"collections": mock_collections, "library": mock_library, "collection_books": mock_collection_books}[name]

    result = add_book_to_collection("collection-123", "book-123", "user-123")

    assert result["success"] is True
    assert result["data"] == created_row
    mock_collection_books.insert.assert_called_once()
    mock_collections.update.assert_called_once()


def test_add_book_collection_not_found(mock_collection_supabase):
    """Test that the collection must belong to the user."""
    mock_collection_supabase.table().select().eq().eq().limit().execute.return_value = make_response([])

    result = add_book_to_collection("missing-collection", "book-123", "user-123")

    assert result["success"] is False
    assert result["message"] == "Collection not found"


def test_add_book_not_in_user_library(mock_collection_supabase):
    """Test that a book must already exist in the user's library."""
    mock_collections = MagicMock()
    mock_library = MagicMock()
    mock_collections.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "collection-123"}])
    mock_library.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([])
    mock_collection_supabase.table.side_effect = lambda name: mock_collections if name == "collections" else mock_library

    result = add_book_to_collection("collection-123", "missing-book", "user-123")

    assert result["success"] is False
    assert result["message"] == "Book is not in the user's library"


def test_add_book_duplicate_relationship(mock_collection_supabase):
    """Test that the same book cannot be added twice."""
    mock_collections = MagicMock()
    mock_library = MagicMock()
    mock_collection_books = MagicMock()
    mock_collections.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "collection-123"}])
    mock_library.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"book_id": "book-123"}])
    mock_collection_books.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"collection_id": "collection-123", "book_id": "book-123"}])
    mock_collection_supabase.table.side_effect = lambda name: {"collections": mock_collections, "library": mock_library, "collection_books": mock_collection_books}[name]

    result = add_book_to_collection("collection-123", "book-123", "user-123")

    assert result["success"] is False
    assert result["message"] == "Book is already in this collection"
    mock_collection_books.insert.assert_not_called()


def test_remove_book_from_collection_success(mock_collection_supabase):
    """Test removing a book relationship from an owned collection."""
    mock_collections = MagicMock()
    mock_collection_books = MagicMock()
    mock_collections.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "collection-123"}])
    deleted_row = {"collection_id": "collection-123", "book_id": "book-123"}
    mock_collection_books.delete.return_value.eq.return_value.eq.return_value.execute.return_value = make_response([deleted_row])
    mock_collection_supabase.table.side_effect = lambda name: mock_collections if name == "collections" else mock_collection_books

    result = remove_book_from_collection("collection-123", "book-123", "user-123")

    assert result["success"] is True
    assert result["data"] == deleted_row
    mock_collection_books.delete.assert_called_once()
    mock_collections.update.assert_called_once()


def test_remove_book_not_in_collection(mock_collection_supabase):
    """Test removing a book that is not in the collection."""
    mock_collections = MagicMock()
    mock_collection_books = MagicMock()
    mock_collections.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = make_response([{"id": "collection-123"}])
    mock_collection_books.delete.return_value.eq.return_value.eq.return_value.execute.return_value = make_response([])
    mock_collection_supabase.table.side_effect = lambda name: mock_collections if name == "collections" else mock_collection_books

    result = remove_book_from_collection("collection-123", "book-123", "user-123")

    assert result["success"] is False
    assert result["message"] == "Book is not in this collection"
