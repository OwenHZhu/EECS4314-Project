/**
 * Frontend tests for the Book Service API helper functions.
 *
 * These tests verify:
 * - getBooks builds the correct request URL.
 * - Search queries are trimmed before being sent.
 * - Empty queries are omitted from the request URL.
 * - Book lists and individual books are returned from the response data.
 * - Missing list data falls back to an empty array.
 * - Failed requests produce clear error messages.
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getBookById,
  getBooks,
} from "../../api/books/bookService.js";

describe("Book Service API helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("getBooks", () => {
    /**
     * Verifies that a trimmed search query and requested limit are included
     * in the Book Service URL.
     */
    it("fetches books using the trimmed query and limit", async () => {
      const books = [
        {
          id: "book-1",
          title: "Dune",
          author: "Frank Herbert",
        },
      ];

      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: books,
        }),
      });

      const result = await getBooks("  Dune  ", 25);

      expect(fetch).toHaveBeenCalledTimes(1);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/api/v1/books/?q=Dune&limit=25",
      );

      expect(result).toEqual(books);
    });

    /**
     * An empty search should request the general book collection without an
     * unnecessary q query parameter.
     */
    it("omits the query parameter when the search is empty", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: [],
        }),
      });

      await getBooks("   ");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/api/v1/books/?limit=50",
      );
    });

    /**
     * The API helper should safely return an empty list when the backend
     * response does not include a data property.
     */
    it("returns an empty array when response data is missing", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      const result = await getBooks();

      expect(result).toEqual([]);
    });

    /**
     * Non-successful HTTP responses should be converted into the message used
     * by the Discover page and search hook.
     */
    it("throws an error when the books request fails", async () => {
      fetch.mockResolvedValue({
        ok: false,
      });

      await expect(
        getBooks("Dune"),
      ).rejects.toThrow("Failed to fetch books.");
    });
  });

  describe("getBookById", () => {
    /**
     * Verifies that the selected book ID is added to the request path and the
     * book stored in the response data property is returned.
     */
    it("fetches and returns one book by ID", async () => {
      const book = {
        id: "book-123",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
      };

      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: book,
        }),
      });

      const result = await getBookById("book-123");

      expect(fetch).toHaveBeenCalledTimes(1);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8001/api/v1/books/book-123",
      );

      expect(result).toEqual(book);
    });

    /**
     * Verifies that failed detail requests expose the expected error message.
     */
    it("throws an error when the book details request fails", async () => {
      fetch.mockResolvedValue({
        ok: false,
      });

      await expect(
        getBookById("missing-book"),
      ).rejects.toThrow(
        "Failed to fetch book details.",
      );
    });
  });
});