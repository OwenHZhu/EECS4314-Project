/**
 * Frontend tests for the LibraryTab component.
 *
 * These tests verify:
 * - The category heading and icon render correctly.
 * - Entries are filtered using the selected library variant.
 * - Entries are sorted using the selected dropdown option.
 * - The correct empty-state message appears when no entries match.
 * - LibraryItem receives the correct entry and variant props.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import LibraryTab from "../../pages/library/components/entries/LibraryTab.jsx";

/**
 * Shared mock functions for the filtering and sorting utilities.
 */
const mocks = vi.hoisted(() => ({
  filterLibraryListByVariant: vi.fn(),
  sortSelectedEntries: vi.fn(),
}));

/**
 * Replaces the real filtering and sorting functions.
 *
 * The pure utility functions are already tested separately, so this test only
 * verifies that LibraryTab calls them correctly and renders their results.
 */
vi.mock("../../hooks/library/useLibrarySorting.js", () => ({
  filterLibraryListByVariant:
    mocks.filterLibraryListByVariant,
  sortSelectedEntries: mocks.sortSelectedEntries,
}));

/**
 * Simplifies the Icon component.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

/**
 * Replaces SortingDropdown with accessible sorting buttons.
 *
 * The currently selected label is displayed, and each option calls the real
 * LibraryTab handleSelection function.
 */
vi.mock(
  "../../pages/library/components/ui/SortingDropdown.jsx",
  () => ({
    default: ({
      options,
      selected,
      handleSelection,
    }) => (
      <div>
        <p data-testid="selected-sort">
          Selected sort: {selected.label}
        </p>

        {options.map((option) => (
          <button
            type="button"
            key={option.label}
            onClick={() => handleSelection(option)}
          >
            Sort by {option.label}
          </button>
        ))}
      </div>
    ),
  })
);

/**
 * Replaces LibraryItem with a small component that exposes its props.
 */
vi.mock(
  "../../pages/library/components/entries/LibraryItem.jsx",
  () => ({
    default: ({ libraryEntry, variant }) => (
      <article data-testid="library-item">
        <p>Book: {libraryEntry.book.title}</p>
        <p>Entry variant: {variant}</p>
      </article>
    ),
  })
);

/**
 * Complete sample library passed into LibraryTab.
 */
const libraryEntries = [
  {
    id: 1,
    book_id: "book-1",
    status: "read",
    is_favourite: true,
    updated_at: "2026-05-01T00:00:00Z",
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
    updated_at: "2026-07-01T00:00:00Z",
    book: {
      title: "Dune",
      author: "Frank Herbert",
    },
  },
  {
    id: 3,
    book_id: "book-3",
    status: "read",
    is_favourite: false,
    updated_at: "2026-06-01T00:00:00Z",
    book: {
      title: "1984",
      author: "George Orwell",
    },
  },
];

describe("LibraryTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    /**
     * Default mocked filtering result contains the two finished books.
     */
    mocks.filterLibraryListByVariant.mockReturnValue([
      libraryEntries[0],
      libraryEntries[2],
    ]);

    /**
     * Default mocked sorting result places 1984 before The Hobbit.
     */
    mocks.sortSelectedEntries.mockReturnValue([
      libraryEntries[2],
      libraryEntries[0],
    ]);
  });

  /**
   * Verifies the category header information.
   */
  it("renders the category title and icon", () => {
    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Finished" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("bookmark_check")
    ).toBeInTheDocument();
  });

  /**
   * Verifies that LibraryTab passes the complete library and selected variant
   * into the filtering utility.
   */
  it("filters the library using the selected variant", () => {
    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    expect(
      mocks.filterLibraryListByVariant
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.filterLibraryListByVariant
    ).toHaveBeenCalledWith(
      libraryEntries,
      "finished"
    );
  });

  /**
   * The default sorting option is Newest.
   */
  it("sorts filtered entries by Newest by default", () => {
    const finishedEntries = [
      libraryEntries[0],
      libraryEntries[2],
    ];

    mocks.filterLibraryListByVariant.mockReturnValue(
      finishedEntries
    );

    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    expect(mocks.sortSelectedEntries).toHaveBeenCalledWith(
      finishedEntries,
      "Newest"
    );

    expect(
      screen.getByTestId("selected-sort")
    ).toHaveTextContent("Selected sort: Newest");
  });

  /**
   * Verifies that every sorted result is rendered as a LibraryItem.
   */
  it("renders each sorted library entry", () => {
    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    const items = screen.getAllByTestId("library-item");

    expect(items).toHaveLength(2);

    expect(screen.getByText("Book: 1984")).toBeInTheDocument();
    expect(
      screen.getByText("Book: The Hobbit")
    ).toBeInTheDocument();
  });

  /**
   * LibraryItem should receive the same category variant as LibraryTab.
   */
  it("passes the selected variant to every LibraryItem", () => {
    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    const variants = screen.getAllByText(
      "Entry variant: finished"
    );

    expect(variants).toHaveLength(2);
  });

  /**
   * Selecting another sorting option updates the local selected state and
   * calls the sorting utility using the new label.
   */
  it("changes the sorting option when selected", async () => {
    const user = userEvent.setup();

    const finishedEntries = [
      libraryEntries[0],
      libraryEntries[2],
    ];

    mocks.filterLibraryListByVariant.mockReturnValue(
      finishedEntries
    );

    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sort by Title (A-Z)",
      })
    );

    expect(
      screen.getByTestId("selected-sort")
    ).toHaveTextContent(
      "Selected sort: Title (A-Z)"
    );

    expect(mocks.sortSelectedEntries).toHaveBeenLastCalledWith(
      finishedEntries,
      "Title (A-Z)"
    );
  });

  /**
   * Verifies all non-default sorting options using one parameterized test.
   */
  it.each([
    "Oldest",
    "Title (A-Z)",
    "Author (A-Z)",
  ])(
    "supports the %s sorting option",
    async (sortingLabel) => {
      const user = userEvent.setup();

      const finishedEntries = [
        libraryEntries[0],
        libraryEntries[2],
      ];

      mocks.filterLibraryListByVariant.mockReturnValue(
        finishedEntries
      );

      render(
        <LibraryTab
          libraryList={libraryEntries}
          icon="bookmark_check"
          iconColour="#ffffff"
          title="Finished"
          variant="finished"
        />
      );

      await user.click(
        screen.getByRole("button", {
          name: `Sort by ${sortingLabel}`,
        })
      );

      expect(
        mocks.sortSelectedEntries
      ).toHaveBeenLastCalledWith(
        finishedEntries,
        sortingLabel
      );
    }
  );

  /**
   * An empty full library should display the variant-specific empty message.
   */
  it("shows an empty-state message when the library is empty", () => {
    mocks.filterLibraryListByVariant.mockReturnValue([]);
    mocks.sortSelectedEntries.mockReturnValue([]);

    render(
      <LibraryTab
        libraryList={[]}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    expect(
      screen.getByText("Keep reading to fill this list!")
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("library-item")
    ).not.toBeInTheDocument();
  });

  /**
   * A non-empty library can still have no entries matching the active variant.
   */
  it("shows an empty-state message when no entries match the variant", () => {
    mocks.filterLibraryListByVariant.mockReturnValue([]);
    mocks.sortSelectedEntries.mockReturnValue([]);

    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark"
        iconColour="#ffffff"
        title="Reading"
        variant="reading"
      />
    );

    expect(
      screen.getByText(
        "Check out your favourites or the Discover page!"
      )
    ).toBeInTheDocument();
  });

  /**
   * Verifies each category uses its own empty-state message.
   */
  it.each([
    [
      "wishlist",
      "Explore new books on the Discover page!",
    ],
    ["dropped", "Hopefully this stays empty..."],
    [
      "favourite",
      "Read more to find your next favourite!",
    ],
  ])(
    "shows the correct empty message for the %s variant",
    (variant, expectedMessage) => {
      mocks.filterLibraryListByVariant.mockReturnValue([]);
      mocks.sortSelectedEntries.mockReturnValue([]);

      render(
        <LibraryTab
          libraryList={libraryEntries}
          icon="bookmark"
          iconColour="#ffffff"
          title={variant}
          variant={variant}
        />
      );

      expect(
        screen.getByText(expectedMessage)
      ).toBeInTheDocument();
    }
  );

  /**
   * The component should render entries in exactly the order returned by the
   * sorting utility.
   */
  it("renders entries in the sorted order", () => {
    mocks.sortSelectedEntries.mockReturnValue([
      libraryEntries[2],
      libraryEntries[0],
    ]);

    render(
      <LibraryTab
        libraryList={libraryEntries}
        icon="bookmark_check"
        iconColour="#ffffff"
        title="Finished"
        variant="finished"
      />
    );

    const items = screen.getAllByTestId("library-item");

    expect(items[0]).toHaveTextContent("Book: 1984");
    expect(items[1]).toHaveTextContent(
      "Book: The Hobbit"
    );
  });
});