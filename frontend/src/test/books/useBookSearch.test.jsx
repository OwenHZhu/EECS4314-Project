/**
 * Frontend tests for the useBookSearch hook.
 *
 * These tests verify:
 * - The hook enters a loading state before requesting books.
 * - Book Service requests are delayed by the 250 ms debounce.
 * - Search queries are sent with the configured 50-book limit.
 * - Books can be filtered using array-based and legacy string genres.
 * - Selecting "all" returns every book from the response.
 * - Failed requests clear the results and expose an error message.
 * - Previous debounce timers are cancelled when search values change.
 */

import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getBooks } from "../../api/books/bookService.js";
import { useBookSearch } from "../../hooks/books/useBookSearch.js";

vi.mock("../../api/books/bookService.js", () => ({
  getBooks: vi.fn(),
}));

/**
 * Representative books returned by the mocked Book Service.
 *
 * The collection includes both the current array-based genre format and the
 * older string genre format supported by the hook.
 */
const books = [
  {
    id: "book-1",
    title: "Dune",
    author: "Frank Herbert",
    genre: ["Science Fiction", "Adventure"],
  },
  {
    id: "book-2",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: ["Fantasy", "Adventure"],
  },
  {
    id: "book-3",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
  },
];

describe("useBookSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getBooks.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /**
   * Advances the hook past its 250 ms search delay and allows the asynchronous
   * Book Service request and React state updates to complete.
   */
  async function completeDebouncedSearch() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
  }

  /**
   * The hook should immediately enter its loading state, but it should not
   * contact the Book Service before the debounce delay finishes.
   */
  it("starts loading and waits for the debounce before fetching", async () => {
    getBooks.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useBookSearch("Dune", "all"),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");
    expect(result.current.results).toEqual([]);
    expect(getBooks).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(249);
    });

    expect(getBooks).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(getBooks).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifies that the user's query and the hook's configured result limit are
   * passed to the Book Service after the debounce completes.
   */
  it("requests books using the query and 50-book limit", async () => {
    getBooks.mockResolvedValue(books);

    const { result } = renderHook(() =>
      useBookSearch("Dune", "all"),
    );

    await completeDebouncedSearch();

    expect(getBooks).toHaveBeenCalledTimes(1);
    expect(getBooks).toHaveBeenCalledWith("Dune", 50);

    expect(result.current.results).toEqual(books);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  /**
   * Book Service responses store genres in an array. Genre comparisons should
   * be case-insensitive and return only matching books.
   */
  it("filters books with array-based genres", async () => {
    getBooks.mockResolvedValue(books);

    const { result } = renderHook(() =>
      useBookSearch("", "fantasy"),
    );

    await completeDebouncedSearch();

    expect(result.current.results).toEqual([
      {
        id: "book-2",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: ["Fantasy", "Adventure"],
      },
    ]);
  });

  /**
   * Older frontend mock data may store genre as one string instead of an
   * array. The hook should continue supporting that format.
   */
  it("filters books with a legacy string genre", async () => {
    getBooks.mockResolvedValue(books);

    const { result } = renderHook(() =>
      useBookSearch("", "DYSTOPIAN"),
    );

    await completeDebouncedSearch();

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].title).toBe("1984");
  });

  /**
   * The "all" option disables genre filtering and preserves the complete list
   * returned by the Book Service.
   */
  it("returns every book when the selected genre is all", async () => {
    getBooks.mockResolvedValue(books);

    const { result } = renderHook(() =>
      useBookSearch("", "all"),
    );

    await completeDebouncedSearch();

    expect(result.current.results).toEqual(books);
  });

  /**
   * Failed Book Service requests should clear any displayed results, stop the
   * loading state, and expose the request error to the Discover page.
   */
  it("handles Book Service request errors", async () => {
    getBooks.mockRejectedValue(
      new Error("Failed to fetch books."),
    );

    const { result } = renderHook(() =>
      useBookSearch("Unknown", "all"),
    );

    await completeDebouncedSearch();

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to fetch books.",
    );
  });

  /**
   * Changing the search query before 250 ms should cancel the original timer.
   * Only the newest query should be sent to the Book Service.
   */
  it("cancels the previous debounce when the query changes", async () => {
    getBooks.mockResolvedValue(books);

    const { rerender } = renderHook(
      ({ query, genre }) =>
        useBookSearch(query, genre),
      {
        initialProps: {
          query: "Du",
          genre: "all",
        },
      },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    rerender({
      query: "Dune",
      genre: "all",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(249);
    });

    expect(getBooks).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(getBooks).toHaveBeenCalledTimes(1);
    expect(getBooks).toHaveBeenCalledWith("Dune", 50);
  });
});