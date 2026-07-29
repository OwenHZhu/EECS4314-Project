/**
 * Frontend tests for the LibraryItem component.
 *
 * These tests verify:
 * - Book metadata and cover image render correctly.
 * - Variant-specific date text is displayed.
 * - Edit opens the edit modal for non-favourite entries.
 * - Delete opens the delete confirmation modal.
 * - Favourite entries show Unfavourite instead of Edit.
 * - Clicking Unfavourite calls the correct library action.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import LibraryItem from "../../pages/library/components/entries/LibraryItem.jsx";

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
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

/**
 * Replaces Icon with an accessible button.
 *
 * This lets the test click the close icon using its accessible name.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

/**
 * Replaces EditEntryModal with a small test component that exposes the props
 * passed by LibraryItem.
 */
vi.mock(
  "../../pages/library/components/modals/EditEntryModal.jsx",
  () => ({
    default: ({ libraryEntry, variant }) => (
      <section role="dialog" aria-label="Edit library entry">
        <p>Edit modal book: {libraryEntry.book.title}</p>
        <p>Edit modal variant: {variant}</p>
      </section>
    ),
  })
);

/**
 * Replaces DeleteEntryModal with a small test component that exposes the
 * selected library entry.
 */
vi.mock(
  "../../pages/library/components/modals/DeleteEntryModal.jsx",
  () => ({
    default: ({ libraryEntry }) => (
      <section role="dialog" aria-label="Delete library entry">
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
  rating: 5,
  added_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-07-10T00:00:00Z",
  book: {
    title: "Dune",
    author: "Frank Herbert",
    cover_image: "https://example.com/dune.jpg",
  },
};

describe("LibraryItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDateText.mockReturnValue("Finished on July 10, 2026");
    mocks.doAction.mockResolvedValue(undefined);
  });

  /**
   * Verifies that the main book information is displayed.
   */
  it("renders the book title, author, and cover image", () => {
    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="finished"
      />
    );

    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();

    const cover = screen.getByRole("img", {
      name: "Cover image for Dune",
    });

    expect(cover).toBeInTheDocument();
    expect(cover).toHaveAttribute(
      "src",
      "https://example.com/dune.jpg"
    );
  });

  /**
   * Verifies that LibraryItem requests and displays the correct date text.
   */
  it("displays the variant-specific date text", () => {
    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="finished"
      />
    );

    expect(mocks.getDateText).toHaveBeenCalledTimes(1);
    expect(mocks.getDateText).toHaveBeenCalledWith(
      libraryEntry,
      "finished"
    );

    expect(
      screen.getByText("Finished on July 10, 2026")
    ).toBeInTheDocument();
  });

  /**
   * Non-favourite variants should display an Edit button.
   */
  it("shows the Edit button for a non-favourite entry", () => {
    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="finished"
      />
    );

    expect(
      screen.getByRole("button", { name: "Edit" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Unfavourite" })
    ).not.toBeInTheDocument();
  });

  /**
   * Clicking Edit should render EditEntryModal using the selected entry and
   * current variant.
   */
  it("opens the edit modal when Edit is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="finished"
      />
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Edit library entry",
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Edit" })
    );

    expect(
      screen.getByRole("dialog", {
        name: "Edit library entry",
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
   * Clicking the close icon should open the delete confirmation modal.
   */
  it("opens the delete modal when the close icon is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="reading"
      />
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Delete library entry",
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "close" })
    );

    expect(
      screen.getByRole("dialog", {
        name: "Delete library entry",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delete modal book: Dune")
    ).toBeInTheDocument();
  });

  /**
   * Favourite entries should show Unfavourite instead of Edit.
   */
  it("shows Unfavourite instead of Edit for the favourite variant", () => {
    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="favourite"
      />
    );

    expect(
      screen.getByRole("button", { name: "Unfavourite" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
  });

  /**
   * Clicking Unfavourite should call doAction with favourite set to false
   * and rating set to null.
   */
  it("removes the entry from favourites when Unfavourite is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="favourite"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Unfavourite" })
    );

    expect(mocks.doAction).toHaveBeenCalledTimes(1);

    expect(mocks.doAction).toHaveBeenCalledWith(
      libraryEntry,
      "favourite",
      false,
      null
    );
  });

  /**
   * Clicking the close icon a second time should toggle the delete modal off.
   */
  it("toggles the delete modal closed when the icon is clicked again", async () => {
    const user = userEvent.setup();

    render(
      <LibraryItem
        libraryEntry={libraryEntry}
        variant="finished"
      />
    );

    const closeButton = screen.getByRole("button", {
      name: "close",
    });

    await user.click(closeButton);

    expect(
      screen.getByRole("dialog", {
        name: "Delete library entry",
      })
    ).toBeInTheDocument();

    await user.click(closeButton);

    expect(
      screen.queryByRole("dialog", {
        name: "Delete library entry",
      })
    ).not.toBeInTheDocument();
  });
});