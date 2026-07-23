/**
 * Frontend tests for the useLibraryActions hook.
 *
 * These tests verify:
 * - Date text is generated correctly for every library variant.
 * - Finished entries map to the backend "read" status.
 * - Reading and wishlist entries preserve their frontend status.
 * - Dropped entries send favourite and rating updates.
 * - Unfavouriting preserves the existing status and rating.
 * - Unknown variants do not update the library.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useLibraryActions } from "../../hooks/library/useLibraryActions.js";

/**
 * Creates the library update mock before Vitest hoists vi.mock.
 */
const mocks = vi.hoisted(() => ({
  updateLibraryEntry: vi.fn(),
}));

/**
 * Replaces the real library context hook.
 *
 * This lets the tests inspect update requests without calling the backend.
 */
vi.mock("../../hooks/library/useLibrary.js", () => ({
  useLibrary: () => ({
    updateLibraryEntry: mocks.updateLibraryEntry,
  }),
}));

/**
 * Representative library entry.
 *
 * Date objects are used rather than ISO strings so the test does not depend
 * on browser parsing or timezone conversion behavior.
 */
const libraryEntry = {
  id: 1,
  book_id: "book-123",
  status: "read",
  is_favourite: true,
  rating: 4,
  added_at: new Date(2026, 0, 2),
  updated_at: new Date(2026, 6, 15),
  book: {
    title: "Dune",
    author: "Frank Herbert",
  },
};

describe("useLibraryActions getDateText", () => {
  /**
   * Finished entries display the date range from when reading began until
   * the entry was completed.
   */
  it("returns a date range for finished entries", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "finished"
    );

    expect(dateText).toBe(
      "Jan 2, 2026 to Jul 15, 2026"
    );
  });

  /**
   * Reading entries display only the date reading began.
   */
  it("returns the starting date for reading entries", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "reading"
    );

    expect(dateText).toBe("Since Jan 2, 2026");
  });

  /**
   * Dropped entries display the period between starting and dropping.
   */
  it("returns a date range for dropped entries", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "dropped"
    );

    expect(dateText).toBe(
      "Jan 2, 2026 to Jul 15, 2026"
    );
  });

  /**
   * Wishlist entries treat updated_at as the date they were added.
   */
  it("returns the added date for wishlist entries", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "wishlist"
    );

    expect(dateText).toBe("Added on Jul 15, 2026");
  });

  /**
   * Favourite entries use the same date format as wishlist entries.
   */
  it("returns the added date for favourite entries", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "favourite"
    );

    expect(dateText).toBe("Added on Jul 15, 2026");
  });

  /**
   * Unknown variants fall back to displaying the original added date.
   */
  it("returns the added date for an unknown variant", () => {
    const { result } = renderHook(() => useLibraryActions());

    const dateText = result.current.getDateText(
      libraryEntry,
      "unknown"
    );

    expect(dateText).toBe("Jan 2, 2026");
  });
});

describe("useLibraryActions doAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.updateLibraryEntry.mockResolvedValue({
      success: true,
    });
  });

  /**
   * The UI calls completed books "finished", but the backend expects "read".
   * Favourite and rating changes should also be included.
   */
  it("maps finished to the backend read status", async () => {
    const { result } = renderHook(() => useLibraryActions());

    await result.current.doAction(
      libraryEntry,
      "finished",
      true,
      5
    );

    expect(mocks.updateLibraryEntry).toHaveBeenCalledTimes(1);

    expect(mocks.updateLibraryEntry).toHaveBeenCalledWith(
      "book-123",
      "read",
      true,
      5
    );
  });

  /**
   * Reading entries retain their reading status and do not send favourite
   * or rating changes.
   */
  it("updates an entry to reading", async () => {
    const { result } = renderHook(() => useLibraryActions());

    await result.current.doAction(
      libraryEntry,
      "reading",
      true,
      5
    );

    expect(mocks.updateLibraryEntry).toHaveBeenCalledWith(
      "book-123",
      "reading",
      null,
      null
    );
  });

  /**
   * Wishlist entries retain their wishlist status and clear unsupported
   * favourite and rating arguments.
   */
  it("updates an entry to wishlist", async () => {
    const { result } = renderHook(() => useLibraryActions());

    await result.current.doAction(
      libraryEntry,
      "wishlist",
      true,
      5
    );

    expect(mocks.updateLibraryEntry).toHaveBeenCalledWith(
      "book-123",
      "wishlist",
      null,
      null
    );
  });

  /**
   * Dropped entries may retain a favourite value and rating.
   */
  it("updates an entry to dropped", async () => {
    const { result } = renderHook(() => useLibraryActions());

    await result.current.doAction(
      libraryEntry,
      "dropped",
      false,
      2
    );

    expect(mocks.updateLibraryEntry).toHaveBeenCalledWith(
      "book-123",
      "dropped",
      false,
      2
    );
  });

  /**
   * The favourite action removes the favourite flag while preserving the
   * entry's existing backend status and rating.
   */
  it("unfavourites an entry while preserving status and rating", async () => {
    const { result } = renderHook(() => useLibraryActions());

    await result.current.doAction(
      libraryEntry,
      "favourite",
      false,
      null
    );

    expect(mocks.updateLibraryEntry).toHaveBeenCalledWith(
      "book-123",
      "read",
      false,
      4
    );
  });

  /**
   * The hook returns the value produced by updateLibraryEntry.
   */
  it("returns the result of the library update", async () => {
    const updateResult = {
      success: true,
      entry: libraryEntry,
    };

    mocks.updateLibraryEntry.mockResolvedValue(updateResult);

    const { result } = renderHook(() => useLibraryActions());

    const actionResult = await result.current.doAction(
      libraryEntry,
      "finished",
      true,
      4
    );

    expect(actionResult).toEqual(updateResult);
  });

  /**
   * An unsupported variant should perform no update and return null.
   */
  it("returns null for an unknown variant", async () => {
    const { result } = renderHook(() => useLibraryActions());

    const actionResult = await result.current.doAction(
      libraryEntry,
      "unknown",
      false,
      null
    );

    expect(actionResult).toBeNull();
    expect(
      mocks.updateLibraryEntry
    ).not.toHaveBeenCalled();
  });
});