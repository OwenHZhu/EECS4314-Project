/**
 * ./components/books/BookStatusDropdown.jsx
 *
 * A reusable dropdown component for selecting a book's reading status.
 *
 * The component displays an "Add" button when no reading status has been
 * selected. After the user selects a status, the button displays the
 * currently selected status instead.
 *
 * Responsibilities:
 * - Display the current reading status.
 * - Open and close the status selection menu.
 * - Allow the user to select a reading status.
 * - Notify the parent component when the selected status changes.
 * - Close the menu when the user clicks outside the dropdown.
 *
 * The component currently manages only the dropdown UI. It does not send
 * requests to the Library Service. Backend persistence can later be handled
 * by the parent component through the `onStatusChange` callback.
 */

import { useEffect, useRef, useState } from "react";
import GenericButton from "../generic/GenericButton";

/**
 * Available reading statuses shown in the dropdown.
 *
 * `value` is intended for application logic and future backend integration,
 * while `label` is the text displayed to the user.
 */
const STATUS_OPTIONS = [
  {
    value: "want",
    label: "Want to Read",
  },
  {
    value: "reading",
    label: "In Progress",
  },
  {
    value: "read",
    label: "Read",
  },
  {
    value: "dropped",
    label: "Dropped",
  },
];

/**
 * Converts the stored reading status value into text for the status button.
 *
 * @param {string|null} status - The currently selected reading status.
 * @returns {string} The display label for the current status.
 */
function getStatusLabel(status) {
  const selectedStatus = STATUS_OPTIONS.find(
    (option) => option.value === status
  );

  return selectedStatus?.label ?? "Add";
}

/**
 * Displays the reading status button and its dropdown menu.
 *
 * @param {object} props
 * @param {string|null} props.status
 *   The currently selected reading status.
 *
 * @param {Function} props.onStatusChange
 *   Callback triggered when the user selects a new reading status.
 */
export default function BookStatusDropdown({
  status = null,
  onStatusChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * Closes the dropdown when the user clicks outside of the dropdown area.
   *
   * The event listener is removed when the component unmounts to avoid
   * leaving unnecessary document-level listeners active.
   */
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /**
   * Sends the selected status to the parent component and closes the menu.
   *
   * @param {string} selectedStatus - The status selected by the user.
   */
  function handleStatusSelect(selectedStatus) {
    onStatusChange?.(selectedStatus);
    setIsOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-[115px]"
    >
      <GenericButton
        type="button"
        variant={status ? "secondary" : "primary"}
        onClick={() => setIsOpen((currentState) => !currentState)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="
          flex w-full
          items-center justify-center
          gap-2
          px-4 py-2
          text-[11px]
        "
      >
        <span className="truncate">
          {getStatusLabel(status)}
        </span>

        {/* Arrow rotates to show whether the dropdown is open or closed. */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`
            shrink-0
            transition-transform
            ${isOpen ? "rotate-180" : ""}
          `}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </GenericButton>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select reading status"
          className="
            absolute
            bottom-[calc(100%+8px)]
            left-0
            z-50
            w-[140px]
            overflow-hidden
            rounded-md
            border border-secondary
            bg-input-bg
            shadow-xl
          "
        >
          {STATUS_OPTIONS.map((option) => {
            const isSelected = status === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() =>
                  handleStatusSelect(option.value)
                }
                className={`
                  block
                  w-full
                  px-4 py-2.5
                  text-left
                  text-[11px]
                  transition-colors
                  ${
                    isSelected
                      ? "bg-nav-active-bg text-primary"
                      : "text-tertiary hover:bg-card-fill hover:text-primary"
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}