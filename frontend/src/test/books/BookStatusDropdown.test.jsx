/**
 * Frontend tests for the BookStatusDropdown component.
 *
 * These tests verify:
 * - The trigger displays the correct current reading status.
 * - The status menu opens and closes correctly.
 * - Every available reading status is displayed.
 * - The current status is marked as selected.
 * - Selecting an option calls the provided status handler.
 * - Logged-out users are redirected through the authentication handler.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import BookStatusDropdown from "../../components/books/BookStatusDropdown.jsx";

/**
 * Replaces the generic Icon component with a simple span.
 *
 * The visual Material Symbols implementation is not part of the dropdown's
 * behaviour, so the mock keeps these tests focused on status interactions.
 */
vi.mock("../../components/generic/Icon.jsx", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

describe("BookStatusDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * A book without a reading status should display the default Add label.
   */
  it("displays Add when the book has no current status", () => {
    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Add/i }),
    ).toBeInTheDocument();
  });

  /**
   * Stored status values should be converted into their readable UI labels.
   */
  it("displays the readable label for the current status", () => {
    render(
      <BookStatusDropdown
        status="reading"
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /In Progress/i,
      }),
    ).toBeInTheDocument();
  });

  /**
   * The dropdown menu should remain hidden until the trigger is selected.
   */
  it("opens the reading status menu when clicked", async () => {
    const user = userEvent.setup();

    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("listbox", {
        name: "Select reading status",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Add/i }),
    );

    expect(
      screen.getByRole("listbox", {
        name: "Select reading status",
      }),
    ).toBeInTheDocument();
  });

  /**
   * Opening the dropdown should display all supported library status options.
   */
  it("displays all available reading status options", async () => {
    const user = userEvent.setup();

    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Add/i }),
    );

    expect(
      screen.getByRole("option", {
        name: "Want to Read",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "In Progress",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Read",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Dropped",
      }),
    ).toBeInTheDocument();
  });

  /**
   * The option matching the current book status should expose its selected
   * state through the aria-selected attribute.
   */
  it("marks the current status as selected", async () => {
    const user = userEvent.setup();

    render(
      <BookStatusDropdown
        status="read"
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Read/i }),
    );

    expect(
      screen.getByRole("option", { name: "Read" }),
    ).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByRole("option", {
        name: "Want to Read",
      }),
    ).toHaveAttribute("aria-selected", "false");
  });

  /**
   * Selecting a reading status should pass its stored status value to the
   * handler supplied by the parent component.
   */
  it("calls onStatusChange with the selected status", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Add/i }),
    );

    await user.click(
      screen.getByRole("option", {
        name: "In Progress",
      }),
    );

    expect(onStatusChange).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith("reading");
  });

  /**
   * The menu should close automatically after the user selects a status.
   */
  it("closes the menu after a status is selected", async () => {
    const user = userEvent.setup();

    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Add/i }),
    );

    await user.click(
      screen.getByRole("option", {
        name: "Want to Read",
      }),
    );

    expect(
      screen.queryByRole("listbox", {
        name: "Select reading status",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * Clicking the trigger while the menu is already open should close it.
   */
  it("toggles the menu closed when the trigger is clicked again", async () => {
    const user = userEvent.setup();

    render(
      <BookStatusDropdown
        status={null}
        onStatusChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: /Add/i,
    });

    await user.click(trigger);

    expect(
      screen.getByRole("listbox", {
        name: "Select reading status",
      }),
    ).toBeInTheDocument();

    await user.click(trigger);

    expect(
      screen.queryByRole("listbox", {
        name: "Select reading status",
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * Logged-out users should be sent through the authentication flow instead
   * of being allowed to open the status menu.
   */
  it("calls onAuthRequired instead of opening the menu for logged-out users", async () => {
    const user = userEvent.setup();
    const onAuthRequired = vi.fn();
    const onStatusChange = vi.fn();

    render(
      <BookStatusDropdown
        status={null}
        isAuthenticated={false}
        onAuthRequired={onAuthRequired}
        onStatusChange={onStatusChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Add/i }),
    );

    expect(onAuthRequired).toHaveBeenCalledTimes(1);
    expect(onStatusChange).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("listbox", {
        name: "Select reading status",
      }),
    ).not.toBeInTheDocument();
  });
});