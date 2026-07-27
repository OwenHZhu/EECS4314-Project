/**
 * Frontend tests for the EditEntryModal component.
 *
 * These tests verify:
 * - The modal initializes with the entry's current status.
 * - Rating and favourite controls only appear for finished/dropped entries.
 * - A user can select a different reading status.
 * - A user can change the rating and favourite state.
 * - Saving calls the correct library action.
 * - Cancelling closes the modal without updating the entry.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import EditEntryModal from "../../pages/library/components/modals/EditEntryModal.jsx";

/**
 * Creates mock functions before vi.mock calls are hoisted by Vitest.
 */
const mocks = vi.hoisted(() => ({
  doAction: vi.fn(),
}));

/**
 * Replaces the real library action hook.
 *
 * This keeps the test independent from LibraryProvider and backend requests.
 */
vi.mock("../../hooks/library/useLibraryActions.js", () => ({
  useLibraryActions: () => ({
    doAction: mocks.doAction,
  }),
}));

/**
 * Replaces GenericButton with a regular HTML button so the actions can
 * be queried and clicked accessibly.
 */
vi.mock("../../components/generic/GenericButton.jsx", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

/**
 * Replaces the status dropdown with accessible buttons.
 *
 * The selected status is displayed and every option can be clicked to call
 * the component's real handleSelection function.
 */
vi.mock(
  "../../pages/library/components/ui/EditEntryDropdown.jsx",
  () => ({
    default: ({ options, selected, handleSelection }) => (
      <div>
        <p data-testid="selected-status">
          {selected?.label ?? "No status"}
        </p>

        {options.map((option) => (
          <button
            type="button"
            key={option.variant}
            onClick={() => handleSelection(option)}
          >
            Select {option.label}
          </button>
        ))}
      </div>
    ),
  })
);

/**
 * Replaces StarRating with simple rating buttons.
 *
 * Clicking a rating calls the real setRating state updater supplied by
 * EditEntryModal.
 */
vi.mock(
  "../../pages/library/components/ui/StarRating.jsx",
  () => ({
    default: ({ rating, setRating }) => (
      <div>
        <p data-testid="current-rating">Rating value: {rating}</p>

        <button type="button" onClick={() => setRating(4)}>
          Rate 4
        </button>

        <button type="button" onClick={() => setRating(5)}>
          Rate 5
        </button>
      </div>
    ),
  })
);

/**
 * Simplifies the Icon component while retaining its click behavior.
 *
 * This allows the favourite checkbox icon to be clicked during tests.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

/**
 * Representative finished library entry.
 */
const finishedEntry = {
  id: 1,
  book_id: "book-123",
  status: "read",
  is_favourite: true,
  rating: 4,
  book: {
    title: "Dune",
    author: "Frank Herbert",
  },
};

/**
 * Representative reading entry without rating or favourite values.
 */
const readingEntry = {
  id: 2,
  book_id: "book-456",
  status: "reading",
  is_favourite: false,
  rating: null,
  book: {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
  },
};

describe("EditEntryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.doAction.mockResolvedValue(undefined);
  });

  /**
   * Verifies that the modal and its action buttons render.
   */
  it("renders the edit entry modal", () => {
    render(
      <EditEntryModal
        libraryEntry={finishedEntry}
        variant="finished"
        setEditModal={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Edit Entry" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Save" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
  });

  /**
   * The selected dropdown value should match the current entry variant.
   */
  it("initializes with the current reading status", () => {
    render(
      <EditEntryModal
        libraryEntry={finishedEntry}
        variant="finished"
        setEditModal={vi.fn()}
      />
    );

    expect(screen.getByTestId("selected-status")).toHaveTextContent(
      "Finished"
    );
  });

  /**
   * Finished entries support rating and favourite information.
   */
  it("shows rating and favourite controls for a finished entry", () => {
    render(
      <EditEntryModal
        libraryEntry={finishedEntry}
        variant="finished"
        setEditModal={vi.fn()}
      />
    );

    expect(screen.getByText("Rating:")).toBeInTheDocument();
    expect(screen.getByText("Favourite:")).toBeInTheDocument();

    expect(screen.getByTestId("current-rating")).toHaveTextContent(
      "Rating value: 4"
    );

    expect(
      screen.getByRole("button", { name: "check_box" })
    ).toBeInTheDocument();
  });

  /**
   * Reading and wishlist statuses do not support ratings or favourites.
   */
  it("hides rating and favourite controls for a reading entry", () => {
    render(
      <EditEntryModal
        libraryEntry={readingEntry}
        variant="reading"
        setEditModal={vi.fn()}
      />
    );

    expect(screen.queryByText("Rating:")).not.toBeInTheDocument();
    expect(screen.queryByText("Favourite:")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("current-rating")
    ).not.toBeInTheDocument();
  });

  /**
   * Selecting another status should update the displayed selection and
   * conditionally reveal the additional controls.
   */
  it("changes the selected reading status", async () => {
    const user = userEvent.setup();

    render(
      <EditEntryModal
        libraryEntry={readingEntry}
        variant="reading"
        setEditModal={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Select Dropped" })
    );

    expect(screen.getByTestId("selected-status")).toHaveTextContent(
      "Dropped"
    );

    expect(screen.getByText("Rating:")).toBeInTheDocument();
    expect(screen.getByText("Favourite:")).toBeInTheDocument();
  });

  /**
   * Saving without editing should submit the entry's initial values.
   */
  it("saves the current entry values", async () => {
    const user = userEvent.setup();
    const setEditModal = vi.fn();

    render(
      <EditEntryModal
        libraryEntry={finishedEntry}
        variant="finished"
        setEditModal={setEditModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Save" })
    );

    expect(mocks.doAction).toHaveBeenCalledTimes(1);
    expect(mocks.doAction).toHaveBeenCalledWith(
      finishedEntry,
      "finished",
      true,
      4
    );

    expect(setEditModal).toHaveBeenCalledWith(false);
  });

  /**
   * Verifies that changed status, rating, and favourite values are passed
   * to the library action when saved.
   */
  it("saves updated status, rating, and favourite values", async () => {
    const user = userEvent.setup();
    const setEditModal = vi.fn();

    render(
      <EditEntryModal
        libraryEntry={readingEntry}
        variant="reading"
        setEditModal={setEditModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Select Finished" })
    );

    await user.click(
      screen.getByRole("button", { name: "Rate 5" })
    );

    await user.click(
      screen.getByRole("button", {
        name: "check_box_outline_blank",
      })
    );

    await user.click(
      screen.getByRole("button", { name: "Save" })
    );

    expect(mocks.doAction).toHaveBeenCalledWith(
      readingEntry,
      "finished",
      true,
      5
    );

    expect(setEditModal).toHaveBeenCalledWith(false);
  });

  /**
   * Cancelling should close the modal using the state updater without
   * performing a library update.
   */
  it("closes without saving when cancelled", async () => {
    const user = userEvent.setup();
    const setEditModal = vi.fn();

    render(
      <EditEntryModal
        libraryEntry={finishedEntry}
        variant="finished"
        setEditModal={setEditModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Cancel" })
    );

    expect(mocks.doAction).not.toHaveBeenCalled();
    expect(setEditModal).toHaveBeenCalledTimes(1);

    const stateUpdater = setEditModal.mock.calls[0][0];

    expect(stateUpdater).toBeTypeOf("function");
    expect(stateUpdater(true)).toBe(false);
    expect(stateUpdater(false)).toBe(true);
  });
});