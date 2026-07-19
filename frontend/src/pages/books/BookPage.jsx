/**
 * ./pages/books/BookPage.jsx
 *
 * Temporary book details page used by the View More flow.
 *
 * The page reads the book ID from the route and displays a simple placeholder
 * layout. The full responsive Book Page design can be implemented in the next
 * step, and the data source can later be switched from mock data to the Book
 * Service GET-by-ID endpoint.
 */

import { useParams } from "react-router-dom";
import { BOOKS } from "../../data/mockBook";

export default function BookPage() {
  const { bookId } = useParams();

  const book = BOOKS.find(
    (currentBook) => String(currentBook.id) === String(bookId)
  );

  if (!book) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-primary">
        <h1 className="text-3xl font-semibold">Book not found</h1>
        <p className="mt-3 text-tertiary">
          The selected book could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-primary">
      <title>{book.title} | BookAtlas</title>

      <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-caption">
        Book Details
      </p>

      <h1 className="text-4xl font-semibold">
        {book.title}
      </h1>

      <p className="mt-2 text-tertiary">
        {book.author}
      </p>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-tertiary">
        {book.description || "No description is currently available."}
      </p>
    </div>
  );
}