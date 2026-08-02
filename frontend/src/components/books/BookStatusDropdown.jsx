/**
 * BookStatusDropdown.jsx
 *
 * Dropdown for selecting a user's reading status for a book.
 *
 * The component handles the status dropdown UI. It does not directly call the
 * Library Service. Parent pages can connect backend behaviour through the
 * `onStatusChange` callback.
 *
 * If the user is not authenticated, clicking the button triggers
 * `onAuthRequired` instead of opening the dropdown.
 */

import { useState } from "react";
import Dropdown from "../generic/Dropdown";
import GenericButton from "../generic/GenericButton";
import Icon from "../generic/Icon";

const STATUS_OPTIONS = [
  { value: "wishlist", label: "Want to Read" },
  { value: "reading", label: "In Progress" },
  { value: "read", label: "Read" },
  { value: "dropped", label: "Dropped" },
];

function getStatusLabel(status) {
  const selectedStatus = STATUS_OPTIONS.find(
    (option) => option.value === status
  );

  return selectedStatus?.label ?? "Add";
}

export default function BookStatusDropdown({
  status = null,
  onStatusChange,
  isAuthenticated = true,
  onAuthRequired,
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleStatusSelect(nextStatus) {
    onStatusChange?.(nextStatus);
    setIsOpen(false);
  }

  /**
   * For logged-out users, the Add button should redirect to login instead of
   * opening the reading-status menu.
   */
  if (!isAuthenticated) {
    return (
      <GenericButton
        type="button"
        variant="bookAction"
        onClick={onAuthRequired}
        className="
          flex min-w-[105px]
          items-center justify-center
          gap-2
          px-4 py-2
          text-[11px]
        "
      >
        <span>Add</span>

        <Icon className="text-sm">
          keyboard_arrow_down
        </Icon>
      </GenericButton>
    );
  }

  const trigger = (
    <GenericButton
      type="button"
      variant=""
      className="
      flex min-w-[105px] items-center justify-center gap-2
      bg-book-action px-4 py-2 text-[11px]
     hover:bg-book-action-hover
   "
  >
      <span className="truncate">
        {getStatusLabel(status)}
      </span>

      <Icon
        className={`
          text-sm transition-transform
          ${isOpen ? "rotate-180" : ""}
        `}
      >
        keyboard_arrow_down
      </Icon>
    </GenericButton>
  );

  return (
    <Dropdown
      openSettings={isOpen}
      setOpenSettings={setIsOpen}
      trigger={trigger}
      wrapperClassName="relative"
      menuClassName="
        left-0 right-auto
        top-full
        mt-2
        w-[140px]
        rounded-md
        border border-secondary
        bg-input-bg
        p-0
        shadow-xl
      "
    >
      <div role="listbox" aria-label="Select reading status">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleStatusSelect(option.value)}
              className={`
                block w-full
                px-4 py-2.5
                text-left text-[11px]
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
    </Dropdown>
  );
}