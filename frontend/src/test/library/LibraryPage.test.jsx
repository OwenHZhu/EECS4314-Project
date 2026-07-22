/**
 * Frontend tests for the LibraryPage component.
 *
 * These tests verify:
 * - The library page displays its heading and description.
 * - The Finished category is selected by default.
 * - The user's library is passed to LibraryTab.
 * - Selecting a filter changes the category displayed by LibraryTab.
 *
 * Library context and child components are mocked so these tests focus only
 * on LibraryPage state and category-selection behaviour.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import LibraryPage from "../../pages/library/LibraryPage.jsx";

/**
 * Controlled sample library returned by the mocked useLibrary hook.
 */
const mockLibrary = [
  {
    id: 1,
    book_id: "book-1",
    status: "read",
    is_favourite: true,
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
    book: {
      title: "Dune",
      author: "Frank Herbert",
    },
  },
];

/**
 * Replaces the real library context with predictable test data.
 *
 * This prevents LibraryPage from depending on LibraryProvider or the backend.
 */
vi.mock("../../hooks/library/useLibrary.js", () => ({
  useLibrary: () => ({
    library: mockLibrary,
  }),
}));

/**
 * Replaces LibraryTab with a small test component.
 *
 * Displaying its received props lets the tests verify which category
 * LibraryPage selected and whether it passed the library data correctly.
 */
vi.mock(
  "../../pages/library/components/entries/LibraryTab.jsx",
  () => ({
    default: ({ libraryList, title, variant, icon }) => (
      <section data-testid="library-tab">
        <p>Title: {title}</p>
        <p>Variant: {variant}</p>
        <p>Icon: {icon}</p>
        <p>Entries: {libraryList.length}</p>
      </section>
    ),
  })
);

/**
 * Replaces FilterButton with an accessible HTML button.
 *
 * The real component currently renders a span. Using a button here isolates
 * LibraryPage behaviour and allows category changes to be tested using
 * accessible queries.
 */
vi.mock(
  "../../pages/library/components/ui/FilterButton.jsx",
  () => ({
    default: ({ children, onClick, isSelected, variant }) => (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        data-variant={variant}
      >
        {children}
      </button>
    ),
  })
);

/**
 * Simplifies Material Symbols icons during testing.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

describe("LibraryPage", () => {
  /**
   * Clears mock call information before each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the page's main heading and supporting description render.
   */
  it("renders the library page heading and description", () => {
    render(<LibraryPage />);

    expect(
      screen.getByRole("heading", { name: "My Library" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Track your reading journey!")
    ).toBeInTheDocument();
  });

  /**
   * LibraryPage initializes its selected state using the first option,
   * which is the Finished category.
   */
  it("shows the Finished category by default", () => {
    render(<LibraryPage />);

    expect(screen.getByText("Title: Finished")).toBeInTheDocument();
    expect(screen.getByText("Variant: finished")).toBeInTheDocument();
    expect(screen.getByText("Icon: bookmark_check")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /finished/i })
    ).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * Verifies that the library obtained from useLibrary is passed to
   * LibraryTab rather than being replaced or omitted.
   */
  it("passes the user's library entries to LibraryTab", () => {
    render(<LibraryPage />);

    expect(screen.getByText("Entries: 2")).toBeInTheDocument();
  });

  /**
   * Verifies that selecting Reading updates the props given to LibraryTab.
   */
  it("changes to the Reading category when selected", async () => {
    const user = userEvent.setup();

    render(<LibraryPage />);

    await user.click(
      screen.getByRole("button", { name: /reading/i })
    );

    expect(screen.getByText("Title: Reading")).toBeInTheDocument();
    expect(screen.getByText("Variant: reading")).toBeInTheDocument();
    expect(screen.getByText("Icon: bookmark")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /reading/i })
    ).toHaveAttribute("aria-pressed", "true");

    expect(
      screen.getByRole("button", { name: /finished/i })
    ).toHaveAttribute("aria-pressed", "false");
  });

  /**
   * Verifies that the remaining library category filters update the selected
   * LibraryTab category correctly.
   */
  it.each([
    ["Wishlist", "wishlist", "bookmark_star"],
    ["Dropped", "dropped", "delete"],
    ["Favourite", "favourite", "bookmark_heart"],
  ])(
    "changes to the %s category when selected",
    async (label, variant, icon) => {
      const user = userEvent.setup();

      render(<LibraryPage />);

      await user.click(
        screen.getByRole("button", {
          name: new RegExp(label, "i"),
        })
      );

      expect(
        screen.getByText(`Title: ${label}`)
      ).toBeInTheDocument();

      expect(
        screen.getByText(`Variant: ${variant}`)
      ).toBeInTheDocument();

      expect(
        screen.getByText(`Icon: ${icon}`)
      ).toBeInTheDocument();
    }
  );
});