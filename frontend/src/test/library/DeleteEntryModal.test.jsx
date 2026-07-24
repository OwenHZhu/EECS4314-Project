/**
 * Frontend tests for the DeleteEntryModal component.
 *
 * These tests verify:
 * - The confirmation modal displays the correct content.
 * - Confirming deletes the correct library entry.
 * - The modal closes after a successful deletion.
 * - Cancelling closes the modal without deleting the entry.
 *
 * The library hook and GenericModal are mocked so the tests focus specifically
 * on DeleteEntryModal's action wiring.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import DeleteEntryModal from "../../pages/library/components/modals/DeleteEntryModal.jsx";

/**
 * Mock functions shared by the tests.
 */
const mockDeleteLibraryEntry = vi.fn();

/**
 * Replaces the real library context with a controlled deletion function.
 *
 * This prevents the test from making any API or backend requests.
 */
vi.mock("../../hooks/library/useLibrary.js", () => ({
  useLibrary: () => ({
    deleteLibraryEntry: mockDeleteLibraryEntry,
  }),
}));

/**
 * Replaces GenericModal with a simplified accessible test component.
 *
 * The mock exposes the props passed by DeleteEntryModal and provides normal
 * HTML buttons for triggering onConfirm and onCancel.
 */
vi.mock("../../components/generic/GenericModal.jsx", () => ({
  default: ({
    title,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }) => (
    <section role="dialog" aria-label={title}>
      <h1>{title}</h1>

      <button type="button" onClick={onConfirm}>
        {confirmLabel}
      </button>

      <button type="button" onClick={onCancel}>
        {cancelLabel}
      </button>
    </section>
  ),
}));

/**
 * Representative library entry used by the modal.
 */
const libraryEntry = {
  id: 1,
  book_id: "book-123",
  status: "reading",
  is_favourite: false,
  rating: null,
  book: {
    title: "Dune",
    author: "Frank Herbert",
  },
};

describe("DeleteEntryModal", () => {
  /**
   * Resets mock history and supplies a resolved deletion promise before
   * each test.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteLibraryEntry.mockResolvedValue(undefined);
  });

  /**
   * Verifies that DeleteEntryModal passes the correct title and action labels
   * into GenericModal.
   */
  it("renders the delete confirmation content", () => {
    const setDeleteModal = vi.fn();

    render(
      <DeleteEntryModal
        libraryEntry={libraryEntry}
        setDeleteModal={setDeleteModal}
      />
    );

    expect(
      screen.getByRole("dialog", {
        name: "Delete from your library?",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Delete from your library?",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Delete" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
  });

  /**
   * Confirming the deletion should send the entry's book_id to the library
   * context deletion function.
   */
  it("deletes the selected library entry when confirmed", async () => {
    const user = userEvent.setup();
    const setDeleteModal = vi.fn();

    render(
      <DeleteEntryModal
        libraryEntry={libraryEntry}
        setDeleteModal={setDeleteModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(mockDeleteLibraryEntry).toHaveBeenCalledTimes(1);
    expect(mockDeleteLibraryEntry).toHaveBeenCalledWith(
      "book-123"
    );
  });

  /**
   * DeleteEntryModal waits for the asynchronous deletion to finish and then
   * tells the parent component to close the modal.
   */
  it("closes the modal after the entry is deleted", async () => {
    const user = userEvent.setup();
    const setDeleteModal = vi.fn();

    render(
      <DeleteEntryModal
        libraryEntry={libraryEntry}
        setDeleteModal={setDeleteModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(mockDeleteLibraryEntry).toHaveBeenCalled();

    expect(setDeleteModal).toHaveBeenCalledTimes(1);
    expect(setDeleteModal).toHaveBeenCalledWith(false);
  });

  /**
   * Cancelling should close the modal by updating the previous visibility
   * state without calling the deletion function.
   */
  it("closes without deleting when cancelled", async () => {
    const user = userEvent.setup();
    const setDeleteModal = vi.fn();

    render(
      <DeleteEntryModal
        libraryEntry={libraryEntry}
        setDeleteModal={setDeleteModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Cancel" })
    );

    expect(mockDeleteLibraryEntry).not.toHaveBeenCalled();
    expect(setDeleteModal).toHaveBeenCalledTimes(1);

    const stateUpdater = setDeleteModal.mock.calls[0][0];

    expect(stateUpdater).toBeTypeOf("function");
    expect(stateUpdater(true)).toBe(false);
    expect(stateUpdater(false)).toBe(true);
  });

  /**
   * Confirms that the modal does not close before an asynchronous deletion
   * has completed.
   */
  it("waits for deletion to finish before closing", async () => {
    const user = userEvent.setup();
    const setDeleteModal = vi.fn();

    let finishDeletion;

    mockDeleteLibraryEntry.mockReturnValue(
      new Promise((resolve) => {
        finishDeletion = resolve;
      })
    );

    render(
      <DeleteEntryModal
        libraryEntry={libraryEntry}
        setDeleteModal={setDeleteModal}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete" })
    );

    expect(mockDeleteLibraryEntry).toHaveBeenCalledWith(
      "book-123"
    );

    expect(setDeleteModal).not.toHaveBeenCalled();

    finishDeletion();

    await vi.waitFor(() => {
      expect(setDeleteModal).toHaveBeenCalledWith(false);
    });
  });
});