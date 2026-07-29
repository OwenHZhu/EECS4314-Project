/**
 * Frontend tests for the library filtering and sorting utilities.
 *
 * These tests verify:
 * - Library entries are filtered into the correct reading categories.
 * - Favourite entries are filtered using the is_favourite property.
 * - Unknown variants return the complete library.
 * - Entries can be sorted by newest and oldest update date.
 * - Entries can be sorted alphabetically by title and author.
 * - Sorting does not mutate the original library array.
 */

import { describe, it, expect } from "vitest";
import {
  filterLibraryListByVariant,
  sortSelectedEntries,
} from "../../hooks/library/useLibrarySorting.js";

/**
 * Representative library data shared across the tests.
 *
 * The entries intentionally use different statuses, favourite values,
 * dates, titles, and authors so every filtering and sorting option can
 * be tested independently.
 */
const libraryEntries = [
  {
    id: 1,
    book_id: "book-1",
    status: "read",
    is_favourite: true,
    rating: 5,
    added_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
    book: {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
    },
  },
  {
    id: 2,
    book_id: "book-2",
    status: "reading",
    is_favourite: false,
    rating: null,
    added_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
    book: {
      title: "Dune",
      author: "Frank Herbert",
    },
  },
  {
    id: 3,
    book_id: "book-3",
    status: "wishlist",
    is_favourite: false,
    rating: null,
    added_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-04-20T00:00:00Z",
    book: {
      title: "1984",
      author: "George Orwell",
    },
  },
  {
    id: 4,
    book_id: "book-4",
    status: "dropped",
    is_favourite: true,
    rating: 2,
    added_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-05-05T00:00:00Z",
    book: {
      title: "Brave New World",
      author: "Aldous Huxley",
    },
  },
];

describe("filterLibraryListByVariant", () => {
  /**
   * The frontend calls completed books "finished", while the backend stores
   * their status as "read". This test verifies that mapping.
   */
  it("returns read entries for the finished variant", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "finished"
    );

    expect(result).toHaveLength(1);
    expect(result[0].book_id).toBe("book-1");
    expect(result[0].status).toBe("read");
  });

  /**
   * Verifies that currently-reading entries are selected using the
   * reading backend status.
   */
  it("returns entries with reading status", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "reading"
    );

    expect(result).toHaveLength(1);
    expect(result[0].book_id).toBe("book-2");
  });

  /**
   * Verifies that wishlist entries are placed in the wishlist category.
   */
  it("returns entries with wishlist status", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "wishlist"
    );

    expect(result).toHaveLength(1);
    expect(result[0].book_id).toBe("book-3");
  });

  /**
   * Verifies that dropped entries are placed in the dropped category.
   */
  it("returns entries with dropped status", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "dropped"
    );

    expect(result).toHaveLength(1);
    expect(result[0].book_id).toBe("book-4");
  });

  /**
   * Favourite is not a reading status. It is determined using the separate
   * is_favourite property and can therefore include multiple statuses.
   */
  it("returns every entry marked as favourite", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "favourite"
    );

    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.book_id)).toEqual([
      "book-1",
      "book-4",
    ]);
  });

  /**
   * The utility's fallback behaviour should return the full collection
   * when it receives an unrecognized variant.
   */
  it("returns the complete library for an unknown variant", () => {
    const result = filterLibraryListByVariant(
      libraryEntries,
      "unknown"
    );

    expect(result).toEqual(libraryEntries);
  });
});

describe("sortSelectedEntries", () => {
  /**
   * Newest sorting should place the most recently updated entry first.
   */
  it("sorts entries from newest to oldest", () => {
    const result = sortSelectedEntries(
      libraryEntries,
      "Newest"
    );

    expect(result.map((entry) => entry.book_id)).toEqual([
      "book-2",
      "book-1",
      "book-4",
      "book-3",
    ]);
  });

  /**
   * Oldest sorting should place the earliest updated entry first.
   */
  it("sorts entries from oldest to newest", () => {
    const result = sortSelectedEntries(
      libraryEntries,
      "Oldest"
    );

    expect(result.map((entry) => entry.book_id)).toEqual([
      "book-3",
      "book-4",
      "book-1",
      "book-2",
    ]);
  });

  /**
   * Title sorting should ignore letter casing and arrange titles
   * alphabetically from A to Z.
   */
  it("sorts entries alphabetically by book title", () => {
    const result = sortSelectedEntries(
      libraryEntries,
      "Title (A-Z)"
    );

    expect(result.map((entry) => entry.book.title)).toEqual([
      "1984",
      "Brave New World",
      "Dune",
      "The Hobbit",
    ]);
  });

  /**
   * Author sorting should ignore letter casing and arrange authors
   * alphabetically from A to Z.
   */
  it("sorts entries alphabetically by author", () => {
    const result = sortSelectedEntries(
      libraryEntries,
      "Author (A-Z)"
    );

    expect(result.map((entry) => entry.book.author)).toEqual([
      "Aldous Huxley",
      "Frank Herbert",
      "George Orwell",
      "J.R.R. Tolkien",
    ]);
  });

  /**
   * Sorting should operate on a copied array rather than changing the
   * original library state used by React.
   */
  it("does not mutate the original array while sorting", () => {
    const originalOrder = libraryEntries.map(
      (entry) => entry.book_id
    );

    sortSelectedEntries(libraryEntries, "Newest");

    expect(
      libraryEntries.map((entry) => entry.book_id)
    ).toEqual(originalOrder);
  });

  /**
   * An unsupported sorting label should preserve the current order.
   */
  it("preserves the entry order for an unknown sorting option", () => {
    const result = sortSelectedEntries(
      libraryEntries,
      "Unknown"
    );

    expect(result).toEqual(libraryEntries);
  });
});