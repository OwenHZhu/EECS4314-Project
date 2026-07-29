import pytest
from pydantic import ValidationError

from library_service.schemas.library import LibraryEntryCreate, LibraryEntryUpdate, ReadingStatus


def test_library_entry_create_valid():
    """Test valid library entry creation."""
    entry = LibraryEntryCreate(book_id="book-123", status="reading", is_favourite=False, rating=4)

    assert entry.book_id == "book-123"
    assert entry.status == ReadingStatus.READING
    assert entry.rating == 4


def test_library_entry_create_invalid_status():
    """Test that unsupported reading statuses are rejected."""
    with pytest.raises(ValidationError):
        LibraryEntryCreate(book_id="book-123", status="paused")


@pytest.mark.parametrize("rating", [0, 6])
def test_library_entry_create_invalid_rating(rating):
    """Test that ratings outside the 1 to 5 range are rejected."""
    with pytest.raises(ValidationError):
        LibraryEntryCreate(book_id="book-123", status="read", rating=rating)


def test_library_entry_create_optional_rating():
    """Test that rating is optional when adding a library entry."""
    entry = LibraryEntryCreate(book_id="book-123", status="wishlist")

    assert entry.rating is None
    assert entry.is_favourite is False


def test_library_entry_update_optional_fields():
    """Test that all update fields except book_id are optional."""
    entry = LibraryEntryUpdate(book_id="book-123")

    assert entry.status is None
    assert entry.is_favourite is None
    assert entry.rating is None
    assert entry.start_date is None
    assert entry.end_date is None
