/**
 * Frontend tests for the DiscoverPage component.
 *
 * These tests verify:
 * - Search text and genre selections are passed to useBookSearch.
 * - Loading, error, empty-result, and successful-result states are displayed.
 * - Clicking a book opens the BookDetailsModal.
 * - Closing the modal clears the selected book.
 * - View More navigates to the selected book page.
 * - Logged-out users are redirected when they attempt protected actions.
 * - Authenticated users can create or update Library Service entries.
 * - Wishlist is used as the fallback status for favourites and ratings.
 */

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { DiscoverPage } from "../../pages/DiscoverPage.jsx";
import { useBookSearch } from "../../hooks/books/useBookSearch.js";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { useLibrary } from "../../hooks/library/useLibrary.js";

/**
 * Stores the mocked React Router navigation function.
 *
 * This allows the tests to verify navigation to login and individual book
 * detail pages.
 */
const mockNavigate = vi.fn();

/**
 * Mocks React Router while preserving only the navigation hook required by
 * DiscoverPage.
 */
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

/**
 * Mocks the search hook used by DiscoverPage.
 *
 * Each test controls the returned books, loading state, and error message.
 */
vi.mock("../../hooks/books/useBookSearch.js", () => ({
  useBookSearch: vi.fn(),
}));

/**
 * Mocks the authentication hook so tests can switch between logged-in and
 * logged-out states.
 */
vi.mock("../../hooks/auth/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

/**
 * Mocks the Library Service hook.
 *
 * The tests verify whether DiscoverPage creates a new library entry or updates
 * an existing one after modal interactions.
 */
vi.mock("../../hooks/library/useLibrary.js", () => ({
  useLibrary: vi.fn(),
}));

/**
 * Replaces BookCard with a small clickable button.
 *
 * BookCard behaviour is tested separately. This mock keeps the DiscoverPage
 * tests focused on selecting a book and opening the details modal.
 */
vi.mock("../../components/books/BookCard.jsx", () => ({
  BookCard: ({ book, onClick }) => (
    <button
      type="button"
      onClick={onClick}
    >
      Open {book.title}
    </button>
  ),
}));

/**
 * Replaces BookDetailsModal with a focused interactive test component.
 *
 * The real modal is tested separately. This mock exposes its received state
 * and provides buttons for close, navigation, favourite, status, rating, and
 * authentication-required behaviours.
 */
vi.mock("../../components/books/BookDetailsModal.jsx", () => ({
  default: ({
    book,
    isOpen,
    isAuthenticated,
    initialFavourite,
    initialStatus,
    initialRating,
    onClose,
    onAuthRequired,
    onViewMore,
    onFavouriteChange,
    onStatusChange,
    onRatingChange,
  }) => {
    if (!isOpen || !book) {
      return null;
    }

    return (
      <div role="dialog" aria-label="Book details modal">
        <span>Selected book: {book.title}</span>
        <span>
          Authentication:{" "}
          {isAuthenticated ? "authenticated" : "logged out"}
        </span>
        <span>
          Initial favourite: {String(initialFavourite)}
        </span>
        <span>
          Initial status: {initialStatus || "none"}
        </span>
        <span>
          Initial rating: {initialRating}
        </span>

        <button
          type="button"
          onClick={onClose}
        >
          Close modal
        </button>

        <button
          type="button"
          onClick={() => onViewMore(book)}
        >
          View more
        </button>

        <button
          type="button"
          onClick={onAuthRequired}
        >
          Require authentication
        </button>

        <button
          type="button"
          onClick={() => onFavouriteChange(true, book)}
        >
          Add favourite
        </button>

        <button
          type="button"
          onClick={() => onStatusChange("reading", book)}
        >
          Set reading status
        </button>

        <button
          type="button"
          onClick={() => onRatingChange(4, book)}
        >
          Set rating
        </button>
      </div>
    );
  },
}));

/**
 * Representative books returned by useBookSearch.
 */
const books = [
  {
    id: "book-1",
    title: "Dune",
    author: "Frank Herbert",
    genre: ["Science Fiction"],
  },
  {
    id: "book-2",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: ["Fantasy"],
  },
];

/**
 * Creates a default Library Service mock.
 *
 * Individual tests can override the current library or persistence functions.
 */
function createLibraryMock(overrides = {}) {
  return {
    library: [],
    addLibraryEntry: vi.fn().mockResolvedValue(undefined),
    updateLibraryEntry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useBookSearch.mockReturnValue({
      results: books,
      loading: false,
      error: "",
    });

    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    useLibrary.mockReturnValue(createLibraryMock());
  });

  /**
   * The initial page render should request all genres using an empty search
   * query.
   */
  it("passes the initial search values to useBookSearch", () => {
    render(<DiscoverPage />);

    expect(useBookSearch).toHaveBeenCalledWith("", "all");
  });

  /**
   * Typing in the search input should update the query sent to useBookSearch.
   */
  it("updates the search query when the user types", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    const searchInput = screen.getByPlaceholderText(
      "Search by title, author, or genre…",
    );

    await user.type(searchInput, "Dune");

    expect(useBookSearch).toHaveBeenLastCalledWith(
      "Dune",
      "all",
    );
  });

  /**
   * Selecting a genre filter should update the genre passed to the search
   * hook without changing the current query.
   */
  it("updates the selected genre", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Fantasy",
      }),
    );

    expect(useBookSearch).toHaveBeenLastCalledWith(
      "",
      "fantasy",
    );
  });

  /**
   * While the search hook is loading, DiscoverPage should display its searching
   * summary text.
   */
  it("displays the loading state", () => {
    useBookSearch.mockReturnValue({
      results: [],
      loading: true,
      error: "",
    });

    render(<DiscoverPage />);

    expect(
      screen.getByText("Searching…"),
    ).toBeInTheDocument();
  });

  /**
   * Search hook errors should be displayed above the result summary.
   */
  it("displays a Book Service search error", () => {
    useBookSearch.mockReturnValue({
      results: [],
      loading: false,
      error: "Failed to fetch books.",
    });

    render(<DiscoverPage />);

    expect(
      screen.getByText("Failed to fetch books."),
    ).toBeInTheDocument();
  });

  /**
   * A successful search should display each returned book as a BookCard.
   */
  it("renders books returned by the search hook", () => {
    render(<DiscoverPage />);

    expect(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Open The Hobbit",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Showing all 2 books"),
    ).toBeInTheDocument();
  });

  /**
   * When a text query is active, the result summary should include the query
   * and number of matching books.
   */
  it("displays the search result summary", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    await user.type(
      screen.getByPlaceholderText(
        "Search by title, author, or genre…",
      ),
      "Dune",
    );

    expect(
      screen.getByText('2 results for "Dune"'),
    ).toBeInTheDocument();
  });

  /**
   * An empty result collection should display the page's no-results message.
   */
  it("displays the empty-results message", async () => {
    const user = userEvent.setup();

    useBookSearch.mockReturnValue({
      results: [],
      loading: false,
      error: "",
    });

    render(<DiscoverPage />);

    await user.type(
      screen.getByPlaceholderText(
        "Search by title, author, or genre…",
      ),
      "Unknown",
    );

    expect(
      screen.getByText('No books found for "Unknown"'),
    ).toBeInTheDocument();
  });

  /**
   * Clicking a BookCard should select that book and open the details modal.
   */
  it("opens the details modal when a book is selected", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Book details modal",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Selected book: Dune"),
    ).toBeInTheDocument();
  });

  /**
   * Closing the details modal should clear the currently selected book.
   */
  it("closes the details modal", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Close modal",
      }),
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Book details modal",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * Selecting View More should navigate to the full page for the selected
   * book.
   */
  it("navigates to the selected book page", async () => {
    const user = userEvent.setup();

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "View more",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/books/book-1",
    );
  });

  /**
   * The modal's authentication-required callback should redirect the user to
   * the login page.
   */
  it("redirects to login when authentication is required", async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Require authentication",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  /**
   * Favouriting a book that is not already in the user's library should create
   * a new wishlist entry.
   */
  it("creates a wishlist entry when a new book is favourited", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add favourite",
      }),
    );

    await waitFor(() => {
      expect(addLibraryEntry).toHaveBeenCalledWith(
        "book-1",
        "wishlist",
        true,
        null,
      );
    });
  });

  /**
   * Selecting a status for a new book should create a Library Service entry
   * with that status instead of using the wishlist fallback.
   */
  it("creates a library entry with the selected reading status", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Set reading status",
      }),
    );

    await waitFor(() => {
      expect(addLibraryEntry).toHaveBeenCalledWith(
        "book-1",
        "reading",
        false,
        null,
      );
    });
  });

  /**
   * Rating a new book should create a wishlist entry because the Library
   * Service requires a status when creating an entry.
   */
  it("creates a wishlist entry when a new book is rated", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Set rating",
      }),
    );

    await waitFor(() => {
      expect(addLibraryEntry).toHaveBeenCalledWith(
        "book-1",
        "wishlist",
        false,
        4,
      );
    });
  });

  /**
   * When the selected book already exists in the library, changes should
   * update that entry instead of creating a duplicate.
   */
  it("updates an existing library entry", async () => {
    const user = userEvent.setup();
    const updateLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        library: [
          {
            book_id: "book-1",
            status: "wishlist",
            is_favourite: false,
            rating: 2,
          },
        ],
        updateLibraryEntry,
      }),
    );

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    expect(
      screen.getByText("Initial status: wishlist"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Initial rating: 2"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Set reading status",
      }),
    );

    await waitFor(() => {
      expect(updateLibraryEntry).toHaveBeenCalledWith(
        "book-1",
        "reading",
        false,
        2,
      );
    });
  });

  /**
   * Logged-out users should be redirected before DiscoverPage attempts to
   * create or update a Library Service entry.
   */
  it("prevents logged-out users from saving library changes", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn();

    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<DiscoverPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Open Dune",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add favourite",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(addLibraryEntry).not.toHaveBeenCalled();
  });
});