/**
 * Frontend tests for the BookDetailsModal component.
 *
 * These tests verify:
 * - The modal renders only when it is open and has a selected book.
 * - Book information and fallback values are displayed correctly.
 * - Long descriptions are shortened for the modal preview.
 * - The modal closes using its button, backdrop, or Escape key.
 * - View More, favourite, status, and rating interactions call their handlers.
 * - Logged-out users are prevented from changing protected book data.
 * - Background scrolling is disabled while the modal is open.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import BookDetailsModal from "../../components/books/BookDetailsModal.jsx";

/**
 * Replaces the generic Icon component with a simple span.
 *
 * The visual icon implementation does not affect modal behaviour and does not
 * need to be included in these component tests.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

/**
 * Replaces RatingStars with a small interactive test component.
 *
 * The mock preserves the displayed rating and allows the modal's rating
 * callback to be tested without retesting the RatingStars implementation.
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
 * Replaces BookStatusDropdown with a focused interactive mock.
 *
 * The actual dropdown behaviour is tested separately. This mock verifies that
 * the modal passes status values and handles a status change correctly.
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
 * Representative book returned by the Book Service.
 */
const book = {
  id: "book-1",
  title: "Dune",
  author: "Frank Herbert",
  description:
    "Dune follows Paul Atreides as his family takes control of the desert planet Arrakis.",
  cover_image: "https://example.com/dune.jpg",
  library_stats: {
    ratings: {
      average: 4.5,
      total_ratings: 1200,
    },
  },
};

describe("BookDetailsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
  });

  /**
   * A closed modal should not add a dialog to the document.
   */
  it("does not render when the modal is closed", () => {
    render(
      <BookDetailsModal
        book={book}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * The modal requires a selected book and should render nothing without one.
   */
  it("does not render when no book is provided", () => {
    render(
      <BookDetailsModal
        book={null}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("dialog"),
    ).not.toBeInTheDocument();
  });

  /**
   * Verifies that the main information from the selected book is displayed.
   */
  it("renders the selected book information", () => {
    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Dune",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Frank Herbert"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(book.description),
    ).toBeInTheDocument();

    expect(screen.getAllByText("4.5").length).toBeGreaterThan(0);

    expect(
      screen.getByText("• 1,200 ratings"),
    ).toBeInTheDocument();
  });

  /**
   * Missing descriptions and library statistics should be replaced by the
   * modal's visible fallback values.
   */
  it("displays fallback information when details are missing", () => {
    const incompleteBook = {
      id: "book-2",
      title: "Unknown Book",
      author: "Unknown Author",
    };

    render(
      <BookDetailsModal
        book={incompleteBook}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "No description is currently available.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("0.0")).toBeInTheDocument();

    expect(
      screen.getByText("• 0 ratings"),
    ).toBeInTheDocument();
  });

  /**
   * Descriptions longer than the modal preview limit should be shortened to
   * 280 characters and followed by an ellipsis.
   */
  it("shortens descriptions longer than 280 characters", () => {
    const longDescription = "A".repeat(300);

    render(
      <BookDetailsModal
        book={{
          ...book,
          description: longDescription,
        }}
        isOpen
        onClose={vi.fn()}
      />,
    );

    const displayedDescription = screen.getByText(
      `${"A".repeat(280)}...`,
    );

    expect(displayedDescription).toBeInTheDocument();
    expect(displayedDescription.textContent).toHaveLength(283);
  });

  /**
   * Selecting the modal's close button should call the supplied close handler.
   */
  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={onClose}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Close book details modal",
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Pressing Escape should close the modal for keyboard users.
   */
  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Clicking the background surrounding the dialog should close the modal.
   */
  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={onClose}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.parentElement;

    fireEvent.mouseDown(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * Clicking inside the dialog should not be interpreted as a backdrop click.
   */
  it("does not close when the dialog itself is clicked", () => {
    const onClose = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={onClose}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("dialog"));

    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * The View More action should provide the selected book to its handler.
   */
  it("calls onViewMore with the selected book", async () => {
    const user = userEvent.setup();
    const onViewMore = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
        onViewMore={onViewMore}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "View More",
      }),
    );

    expect(onViewMore).toHaveBeenCalledTimes(1);
    expect(onViewMore).toHaveBeenCalledWith(book);
  });

  /**
   * Logged-out users should be sent to the authentication flow instead of
   * being allowed to add the selected book to their favourites.
   */
  it("calls onAuthRequired when a logged-out user changes favourites", async () => {
    const user = userEvent.setup();
    const onAuthRequired = vi.fn();
    const onFavouriteChange = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
        isAuthenticated={false}
        onAuthRequired={onAuthRequired}
        onFavouriteChange={onFavouriteChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add book to favourites",
      }),
    );

    expect(onAuthRequired).toHaveBeenCalledTimes(1);
    expect(onFavouriteChange).not.toHaveBeenCalled();
  });

  /**
   * Authenticated users should be able to add the selected book to favourites.
   * The modal should also update its local favourite button state.
   */
  it("updates favourites for an authenticated user", async () => {
    const user = userEvent.setup();
    const onFavouriteChange = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
        isAuthenticated
        onFavouriteChange={onFavouriteChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add book to favourites",
      }),
    );

    expect(onFavouriteChange).toHaveBeenCalledTimes(1);

    expect(onFavouriteChange).toHaveBeenCalledWith(
      true,
      book,
    );

    expect(
      screen.getByRole("button", {
        name: "Remove book from favourites",
      }),
    ).toBeInTheDocument();
  });

  /**
   * Status changes made through the dropdown should be forwarded with the
   * selected book and reflected in the modal's local status.
   */
  it("calls onStatusChange with the new status and book", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
        isAuthenticated
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Set status to reading",
      }),
    );

    expect(onStatusChange).toHaveBeenCalledTimes(1);

    expect(onStatusChange).toHaveBeenCalledWith(
      "reading",
      book,
    );

    expect(
      screen.getByText("Current status: reading"),
    ).toBeInTheDocument();
  });

  /**
   * Rating changes should be forwarded with the selected book so the parent
   * component can save the new user rating.
   */
  it("calls onRatingChange with the new rating and book", async () => {
    const user = userEvent.setup();
    const onRatingChange = vi.fn();

    render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
        isAuthenticated
        onRatingChange={onRatingChange}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Set rating to 4",
      }),
    );

    expect(onRatingChange).toHaveBeenCalledTimes(1);

    expect(onRatingChange).toHaveBeenCalledWith(
      4,
      book,
    );
  });

  /**
   * Opening the modal should disable page scrolling. The previous overflow
   * value should be restored after the modal is removed.
   */
  it("locks background scrolling while open and restores it when closed", () => {
    document.body.style.overflow = "auto";

    const { unmount } = render(
      <BookDetailsModal
        book={book}
        isOpen
        onClose={vi.fn()}
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });
});