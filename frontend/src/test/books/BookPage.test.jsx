/**
 * Frontend tests for the BookPage component.
 *
 * These tests verify:
 * - The page requests a book using the ID from the route.
 * - Loading, success, missing-book, and request-error states render correctly.
 * - Book metadata and community statistics are displayed.
 * - Existing Library Service data is reflected in the page controls.
 * - Authenticated users can update status, favourites, and ratings.
 * - New library entries are created when the book is not already saved.
 * - Existing library entries are updated instead of duplicated.
 * - Logged-out users are redirected to the login page.
 * - Library Service failures display an error message.
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

import BookPage from "../../pages/books/BookPage.jsx";
import { getBookById } from "../../api/books/bookService.js";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { useLibrary } from "../../hooks/library/useLibrary.js";

/**
 * Stores the mocked React Router navigation function.
 *
 * This allows the tests to verify that unauthenticated users are redirected
 * to the login page when they attempt a protected library action.
 */
const mockNavigate = vi.fn();

/**
 * Partially mocks React Router so the page always receives the same
 * representative route ID and exposes navigation calls for assertions.
 *
 * The real exports are retained because nested components may use Link or
 * other React Router components.
 */
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,

    useParams: () => ({
      bookId: "book-1",
    }),

    useNavigate: () => mockNavigate,
  };
});

/**
 * Mocks the frontend Book Service helper.
 *
 * Individual tests control whether the request resolves, returns no book, or
 * rejects with an error.
 */
vi.mock("../../api/books/bookService.js", () => ({
  getBookById: vi.fn(),
}));

/**
 * Mocks the authentication hook.
 *
 * Each test can choose whether the current user is authenticated.
 */
vi.mock("../../hooks/auth/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

/**
 * Mocks the Library Service context hook.
 *
 * This keeps the tests focused on BookPage while still verifying the arguments
 * sent to addLibraryEntry and updateLibraryEntry.
 */
vi.mock("../../hooks/library/useLibrary.js", () => ({
  useLibrary: vi.fn(),
}));

/**
 * Replaces the generic Icon component with a simple span.
 *
 * The Material Symbols rendering is not part of BookPage behaviour.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

/**
 * Replaces GenericButton with a standard HTML button.
 *
 * The discussion buttons are presentational and do not require the reusable
 * button component's own styling or behaviour in this test file.
 */
vi.mock("../../components/generic/GenericButton.jsx", () => ({
  default: ({ children, ...props }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

/**
 * Replaces BookForumSection with a simple test component.
 *
 * Discussion loading and routing are separate concerns from BookPage's book
 * details and library-action behaviour, so they are isolated in this suite.
 */
vi.mock(
  "../../pages/books/components/BookForumSection.jsx",
  () => ({
    default: ({ bookId }) => (
      <section data-testid="book-forum-section">
        Discussions for {bookId}
      </section>
    ),
  })
);

/**
 * Replaces BookStatusDropdown with a small interactive test component.
 *
 * The real dropdown is tested separately. This mock verifies that BookPage
 * passes the current status and handles status changes correctly.
 */
vi.mock("../../components/books/BookStatusDropdown.jsx", () => ({
  default: ({ status, onStatusChange }) => (
    <div>
      <span>Current status: {status || "none"}</span>

      <button
        type="button"
        onClick={() => onStatusChange("reading")}
      >
        Set status to reading
      </button>
    </div>
  ),
}));

/**
 * Replaces RatingStars with a focused interactive mock.
 *
 * The mock displays the supplied rating and provides a button only when the
 * component receives an onChange handler for the user's personal rating.
 */
vi.mock("../../components/generic/RatingStars.jsx", () => ({
  default: ({ value, onChange, ariaLabel }) => (
    <div aria-label={ariaLabel}>
      <span>{value}</span>

      {onChange && (
        <button
          type="button"
          onClick={() => onChange(4)}
        >
          Set rating to 4
        </button>
      )}
    </div>
  ),
}));

/**
 * Representative Book Service response used throughout the tests.
 */
const book = {
  id: "book-1",
  title: "Dune",
  author: "Frank Herbert",
  description:
    "Dune follows Paul Atreides on the desert planet Arrakis.",
  cover_image: "https://example.com/dune.jpg",
  genre: ["Science Fiction", "Adventure"],
  series: "Dune",
  time_period: "Future",
  page_count: 412,
  published_date: "1965-08-01",
  publisher: "Chilton Books",
  isbn: "9780441172719",
  library_stats: {
    wishlist_count: 35,
    reading_count: 18,
    ratings: {
      average: 4.5,
      total_ratings: 1200,
      distribution: {
        5: 800,
        4: 250,
        3: 100,
        2: 30,
        1: 20,
      },
    },
  },
};

/**
 * Creates default Library Service mock values.
 *
 * Tests can override the library collection or either persistence function.
 */
function createLibraryMock(overrides = {}) {
  return {
    library: [],
    addLibraryEntry: vi.fn().mockResolvedValue(undefined),
    updateLibraryEntry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("BookPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    useLibrary.mockReturnValue(createLibraryMock());

    getBookById.mockResolvedValue(book);
  });

  /**
   * The page should show a loading message while the Book Service request is
   * still unresolved.
   */
  it("displays a loading state while fetching book details", () => {
    getBookById.mockReturnValue(new Promise(() => {}));

    render(<BookPage />);

    expect(
      screen.getByText("Loading book details..."),
    ).toBeInTheDocument();
  });

  /**
   * The route's book ID should be passed to the Book Service details helper.
   */
  it("requests the selected book using the route ID", async () => {
    render(<BookPage />);

    await waitFor(() => {
      expect(getBookById).toHaveBeenCalledTimes(1);
    });

    expect(getBookById).toHaveBeenCalledWith("book-1");
  });

  /**
   * A successful Book Service response should display the selected book's
   * primary information and cover image.
   */
  it("renders the selected book information", async () => {
    render(<BookPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Dune",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Frank Herbert"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(book.description),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Dune cover",
      }),
    ).toHaveAttribute(
      "src",
      "https://example.com/dune.jpg",
    );

    expect(
      screen.getByText("Science Fiction"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Adventure"),
    ).toBeInTheDocument();
  });

  /**
   * Additional metadata supplied by the Book Service should be displayed in
   * the details section.
   */
  it("renders book metadata", async () => {
    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    expect(screen.getAllByText("Dune").length,).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Future")).toBeInTheDocument();
    expect(screen.getByText("412")).toBeInTheDocument();
    expect(screen.getByText("1965-08-01")).toBeInTheDocument();
    expect(screen.getByText("Chilton Books")).toBeInTheDocument();
    expect(screen.getByText("9780441172719")).toBeInTheDocument();
  });

  /**
   * Community rating and library statistics should be displayed using the
   * values returned by the Book Service.
   */
  it("renders community rating and library statistics", async () => {
    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    expect(
      screen.getByText("4.5 • 1200 ratings"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("18"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("35"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("800"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("5 stars"),
    ).toBeInTheDocument();
  });

  /**
   * A rejected Book Service request should display the not-found section and
   * preserve the error message returned by the request helper.
   */
  it("displays the request error when loading fails", async () => {
    getBookById.mockRejectedValue(
      new Error("Failed to fetch book details."),
    );

    render(<BookPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Book not found",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Failed to fetch book details."),
    ).toBeInTheDocument();
  });

  /**
   * A successful request that returns no book should display the page's
   * default missing-book message.
   */
  it("displays the missing-book state when no book is returned", async () => {
    getBookById.mockResolvedValue(null);

    render(<BookPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Book not found",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The selected book could not be found.",
      ),
    ).toBeInTheDocument();
  });

  /**
   * Books without a cover or description should use the visible title and
   * description fallbacks instead of broken or empty content.
   */
  it("displays fallback content for missing book details", async () => {
    getBookById.mockResolvedValue({
      ...book,
      cover_image: "",
      description: "",
    });

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    expect(
      screen.queryByRole("img", {
        name: "Dune cover",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "No description is currently available.",
      ),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Dune").length).toBeGreaterThan(1);
  });

  /**
   * Existing Library Service data should initialize the current reading
   * status, personal rating, and favourite state.
   */
  it("loads the user's existing library values", async () => {
    useLibrary.mockReturnValue(
      createLibraryMock({
        library: [
          {
            book_id: "book-1",
            status: "reading",
            rating: 3,
            is_favourite: true,
          },
        ],
      }),
    );

    render(<BookPage />);

    expect(
      await screen.findByText("Current status: reading"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Rate this book"),
    ).toHaveTextContent("3");

    expect(
      screen.getByRole("button", {
        name: "Remove from favourites",
      }),
    ).toBeInTheDocument();
  });

  /**
   * Changing the status of a book that is not already saved should create a
   * new Library Service entry using the selected status.
   */
  it("creates a library entry when a new status is selected", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Set status to reading",
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
   * Changing the status of an existing library book should update the current
   * entry instead of creating a duplicate.
   */
  it("updates an existing library entry when the status changes", async () => {
    const user = userEvent.setup();
    const updateLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        library: [
          {
            book_id: "book-1",
            status: "wishlist",
            rating: null,
            is_favourite: false,
          },
        ],
        updateLibraryEntry,
      }),
    );

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Set status to reading",
      }),
    );

    await waitFor(() => {
      expect(updateLibraryEntry).toHaveBeenCalledWith(
        "book-1",
        "reading",
        false,
        null,
      );
    });
  });

  /**
   * Adding a favourite for a new book should create a wishlist entry because
   * the Library Service requires a reading status.
   */
  it("creates a wishlist entry when a new book is favourited", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Add to favourites",
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

    expect(
      screen.getByRole("button", {
        name: "Remove from favourites",
      }),
    ).toBeInTheDocument();
  });

  /**
   * Selecting a personal rating should create a Library Service entry and use
   * the wishlist fallback when no reading status has been selected.
   */
  it("saves a personal rating for a new library book", async () => {
    const user = userEvent.setup();
    const addLibraryEntry = vi.fn().mockResolvedValue(undefined);

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry,
      }),
    );

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Set rating to 4",
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
   * Logged-out users should be redirected to the login page instead of being
   * allowed to modify their library.
   */
  it("redirects logged-out users when they attempt a library action", async () => {
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

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Add to favourites",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(addLibraryEntry).not.toHaveBeenCalled();
  });

  /**
   * Library Service failures should display their message without replacing
   * the successfully loaded Book Service content.
   */
  it("displays an error when a library update fails", async () => {
    const user = userEvent.setup();

    useLibrary.mockReturnValue(
      createLibraryMock({
        addLibraryEntry: vi.fn().mockRejectedValue(
          new Error("Failed to update your library."),
        ),
      }),
    );

    render(<BookPage />);

    await screen.findByRole("heading", {
      name: "Dune",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Set status to reading",
      }),
    );

    expect(
      await screen.findByText(
        "Failed to update your library.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Dune",
      }),
    ).toBeInTheDocument();
  });
});