import pytest
from pydantic import ValidationError
from book_service.schemas.book import BookCreate

def test_book_create_valid():
    """Test valid book creation."""
    book = BookCreate(
        title="The Hobbit",
        author="J.R.R. Tolkien",
        external_id="/works/OL12345W"
    )
    assert book.title == "The Hobbit"
    assert book.author == "J.R.R. Tolkien"

def test_book_create_invalid_title():
    """Test that empty titles are rejected (min_length=1)."""
    with pytest.raises(ValidationError):
        BookCreate(
            title="", 
            author="J.R.R. Tolkien", 
            external_id="/works/OL12345W"
        )