import pytest
from pydantic import ValidationError

from library_service.schemas.collection import CollectionBook, CollectionCreate, CollectionUpdate


def test_collection_create_valid():
    """Test valid collection creation data."""
    collection = CollectionCreate(name="Summer Reading", description="Books to read this summer")

    assert collection.name == "Summer Reading"
    assert collection.description == "Books to read this summer"


def test_collection_create_optional_description():
    """Test that a collection description is optional."""
    collection = CollectionCreate(name="Favourites")

    assert collection.description is None


def test_collection_create_empty_name():
    """Test that an empty collection name is rejected."""
    with pytest.raises(ValidationError):
        CollectionCreate(name="")


def test_collection_create_name_too_long():
    """Test that collection names cannot exceed 100 characters."""
    with pytest.raises(ValidationError):
        CollectionCreate(name="a" * 101)


def test_collection_create_description_too_long():
    """Test that collection descriptions cannot exceed 500 characters."""
    with pytest.raises(ValidationError):
        CollectionCreate(name="Favourites", description="a" * 501)


def test_collection_update_optional_fields():
    """Test that all collection update fields are optional."""
    collection = CollectionUpdate()

    assert collection.name is None
    assert collection.description is None


def test_collection_update_partial_data():
    """Test updating only the collection name."""
    collection = CollectionUpdate(name="Updated name")

    assert collection.name == "Updated name"
    assert collection.description is None


def test_collection_book_default_added_at():
    """Test that a collection book receives an added timestamp."""
    collection_book = CollectionBook(collection_id="collection-123", book_id="book-123")

    assert collection_book.collection_id == "collection-123"
    assert collection_book.book_id == "book-123"
    assert collection_book.added_at is not None
