/**
 * Dropdown.jsx
 *
 * Simple dropdown component that toggles visibility of a menu or panel.
 *
 * Props:
 * @param {boolean} openSettings - Whether the dropdown content is currently visible.
 * @param {function} setOpenSettings - State setter used to toggle dropdown visibility.
 * @param {ReactNode} trigger - Element that opens/closes the dropdown when clicked.
 * @param {ReactNode} children - Dropdown content rendered when openSettings is true.
 *
 * Behavior:
 * - Clicking the trigger toggles openSettings.
 * - When openSettings is true, children are displayed in a positioned dropdown panel.
 *
 * Dependencies:
 * - None (utility-free, aside from React itself).
 */

export default function Dropdown({ openSettings, setOpenSettings, trigger, children }) {
  return (
    <div className="relative inline-block">
      {/* Trigger element */}
      <div onClick={() => setOpenSettings(!openSettings)}>
        {trigger}
      </div>

      {/* Dropdown content */}
      {openSettings && (
        <div
          className="absolute right-0 left-5 mt-2 w-fit h-fit bg-[#1A2523] 
          shadow-lg rounded-md p-4 z-50 border-2 border-[#00FFCC]"
        >
          {children}
        </div>
      )}
    </div>
  );
}