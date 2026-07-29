/**
 * Dropdown.jsx
 *
 * Reusable dropdown component that toggles visibility of a menu or panel.
 *
 * Props:
 * @param {boolean} openSettings
 *   Whether the dropdown content is currently visible.
 *
 * @param {Function} setOpenSettings
 *   State setter used to toggle dropdown visibility.
 *
 * @param {ReactNode} trigger
 *   Element that opens/closes the dropdown when clicked.
 *
 * @param {ReactNode} children
 *   Dropdown content rendered when openSettings is true.
 *
 * @param {string} wrapperClassName
 *   Optional classes for positioning the dropdown wrapper.
 *
 * @param {string} menuClassName
 *   Optional classes for styling the dropdown menu.
 *
 * Behaviour:
 * - Clicking the trigger toggles openSettings.
 * - When openSettings is true, children are displayed in a positioned menu.
 * - Default styling is preserved for existing profile dropdown usage.
 */

import { cn } from "../../utils/utils";

export default function Dropdown({
  openSettings,
  setOpenSettings,
  trigger,
  children,
  wrapperClassName = "",
  menuClassName = "",
}) {
  return (
    <div className={cn("relative inline-block", wrapperClassName)}>
      {/* Trigger element */}
      <div onClick={() => setOpenSettings(!openSettings)}>
        {trigger}
      </div>

      {/* Dropdown content */}
      {openSettings && (
        <div
          className={cn(
            `
              absolute right-0 left-5 mt-2
              h-fit w-fit
              rounded-md
              border-2 border-[#00FFCC]
              bg-[#1A2523]
              p-4
              shadow-lg
              z-50
            `,
            menuClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}