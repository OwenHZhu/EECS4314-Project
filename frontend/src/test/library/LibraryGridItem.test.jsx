/**
 * Frontend tests for the LibraryGridItem component.
 *
 * These tests verify:
 * - Book metadata, cover image, date, and rating render correctly.
 * - A title placeholder appears when no cover image is available.
 * - Edit and delete actions open their existing modals through portals.
 * - Favourite entries show the correct marker and Unfavourite action.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";

import LibraryGridItem from "../../pages/library/components/entries/LibraryGridItem.jsx";

/**
 * Shared mock functions used by the mocked library actions hook.
 */
const mocks = vi.hoisted(() => ({
  getDateText: vi.fn(),
  doAction: vi.fn(),
}));

/**
 * Replaces the real useLibraryActions hook with controlled test functions.
 */
vi.mock("../../hooks/library/useLibraryActions.js", () => ({
  useLibraryActions: () => ({
    getDateText: mocks.getDateText,
    doAction: mocks.doAction,
  }),
}));

/**
 * Replaces GenericButton with a normal accessible button.
 */
vi.mock("../../components/generic/GenericButton.jsx", () => ({
  default: ({ children, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

/**
 * Simplifies Icon while preserving its styling classes for rating assertions.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children, className = "" }) => (
    <span className={className}>{children}</span>
  ),
}));

/**
 * Replaces EditEntryModal with a small component exposing its props.
 */
vi.mock(
  "../../pages/library/components/modals/EditEntryModal.jsx",
  () => ({
    default: ({ libraryEntry, variant }) => (
      <section role="dialog" aria-label="Edit grid library entry">
        <p>Edit modal book: {libraryEntry.book.title}</p>
        <p>Edit modal variant: {variant}</p>
      </section>
    ),
  })
);

/**
 * Replaces DeleteEntryModal with a small component exposing its entry.
 */
vi.mock(
  "../../pages/library/components/modals/DeleteEntryModal.jsx",
  () => ({
    default: ({ libraryEntry }) => (
      <section role="dialog" aria-label="Delete grid library entry">
        <p>Delete modal book: {libraryEntry.book.title}</p>
      </section>
    ),
  })
);

/**
 * Representative entry used throughout the tests.
 */
const libraryEntry = {
  id: 1,
  book_id: "book-123",
  status: "read",
  is_favourite: true,
  rating: 2,
  added_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-07-10T00:00:00Z",
  book: {
    title: "Dune",
    author: "Frank Herbert",
    cover_image: "https://example.com/dune.jpg",
  },
};

/**
 * Renders LibraryGridItem inside a router because the component tree
 * contains React Router Link components.
 */
function renderLibraryGridItem({
  entry = libraryEntry,
  variant = "finished",
} = {}) {
  return render(
    <MemoryRouter>
      <LibraryGridItem
        libraryEntry={entry}
        variant={variant}
      />
    </MemoryRouter>
  );
}

describe("LibraryGridItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDateText.mockReturnValue("Finished on July 10, 2026");
    mocks.doAction.mockResolvedValue(undefined);
  });

  /**
   * Verifies that the main book information is displayed.
   */
  it("renders the book title, author, and cover image", () => {
    renderLibraryGridItem({
      variant: "finished",
    });

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();

    const cover = screen.getByRole("img", {
      name: "Cover image for Dune",
    });

    expect(cover).toHaveAttribute(
      "src",
      "https://example.com/dune.jpg"
    );
  });

  /**
   * A missing cover should display the title placeholder instead of an image.
   */
  it("renders a title placeholder when the cover image is missing", () => {
    const entryWithoutCover = {
      ...libraryEntry,
      book: {
        ...libraryEntry.book,
        cover_image: null,
      },
    };

    renderLibraryGridItem({
      entry: entryWithoutCover,
      variant: "finished",
    });

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByText("Dune")).toHaveLength(2);
  });

  /**
   * Verifies that LibraryGridItem requests the correct date text.
   */
  it("displays the variant-specific date text", () => {
    renderLibraryGridItem({
      variant: "finished",
    });

    expect(mocks.getDateText).toHaveBeenCalledWith(
      libraryEntry,
      "finished"
    );

    expect(
      screen.getByText("Finished on July 10, 2026")
    ).toBeInTheDocument();
  });

  /**
   * A two-star rating should use two active and three inactive star colours.
   */
  it("displays the correct active and inactive rating stars", () => {
    renderLibraryGridItem({
      variant: "finished",
    });

    const rating = screen.getByLabelText("2 out of 5 stars");
    const stars = within(rating).getAllByText("star");

    expect(stars).toHaveLength(5);

    expect(
      stars.filter((star) =>
        star.classList.contains("text-yellow-400")
      )
    ).toHaveLength(2);

    expect(
      stars.filter((star) =>
        star.classList.contains("text-gray-400")
      )
    ).toHaveLength(3);
  });

  /**
   * Entries without a rating should expose a clear accessible label.
   */
  it("labels an unrated entry as Not rated", () => {
    renderLibraryGridItem({
      entry: {
        ...libraryEntry,
        rating: null,
      },
      variant: "finished",
    });

    expect(
      screen.getByLabelText("Not rated")
    ).toBeInTheDocument();
  });

  /**
   * Favourite entries display a visible favourite marker.
   */
  it("shows the favourite marker for a favourite entry", () => {
    renderLibraryGridItem({
      variant: "finished",
    });

    expect(
      screen.getByTitle("Favourite")
    ).toBeInTheDocument();

    expect(screen.getByText("favorite")).toBeInTheDocument();
  });

  /**
   * Clicking Edit should open the edit modal through its portal.
   */
  it("opens the edit modal when Edit is clicked", async () => {
    const user = userEvent.setup();

    renderLibraryGridItem({
      variant: "finished",
    });

    await user.click(
      screen.getByRole("button", { name: "Edit" })
    );

    expect(
      screen.getByRole("dialog", {
        name: "Edit grid library entry",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Edit modal book: Dune")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Edit modal variant: finished")
    ).toBeInTheDocument();
  });

  /**
   * Clicking the accessible delete button should open the delete modal.
   */
  it("opens the delete modal when Delete is clicked", async () => {
    const user = userEvent.setup();

    renderLibraryGridItem({
      variant: "finished",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Delete Dune from library",
      })
    );

    expect(
      screen.getByRole("dialog", {
        name: "Delete grid library entry",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delete modal book: Dune")
    ).toBeInTheDocument();
  });

  /**
   * Favourite view uses Unfavourite instead of Edit.
   */
  it("shows Unfavourite instead of Edit for the favourite variant", () => {
    renderLibraryGridItem({
      variant: "favourite",
    });

    expect(
      screen.getByRole("button", {
        name: "Unfavourite",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Edit",
      })
    ).not.toBeInTheDocument();
  });

  /**
   * Clicking Unfavourite should call the existing library action.
   */
  it("removes the entry from favourites when Unfavourite is clicked", async () => {
    const user = userEvent.setup();

    renderLibraryGridItem({
      variant: "favourite",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Unfavourite",
      })
    );

    expect(mocks.doAction).toHaveBeenCalledWith(
      libraryEntry,
      "favourite",
      false,
      null
    );
  });
});