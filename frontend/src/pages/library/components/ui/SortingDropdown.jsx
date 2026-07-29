/**
 * SortingDropdown.jsx
 *
 * A lightweight UI component that displays a dropdown menu for selecting
 * a sorting mode (e.g., Newest, Oldest, Title, Author). This component does not perform 
 * sorting itself. Instead, itvemits the selected option upward via `handleSelection`, 
 * allowing the parent component (e.g., LibraryTab) to apply sorting logic.
 *
 * Responsibilities:
 * - Render a dropdown trigger showing the currently selected sort label
 * - Display a list of available sort options
 * - Emit the selected option when the user clicks an item
 * - Allow the parent to control open/close state
 */

import Dropdown from "../../../../components/generic/Dropdown";
import Icon from "../../../../components/generic/Icon";

/**
 * SortingDropdown
 *
 * @param {object} props
 * @param {Array<{label: string}>} props.options - Available sorting options
 * @param {{label: string}} props.selected - Currently selected sorting option
 * @param {Function} props.handleSelection - Callback fired when user selects an option
 * @param {boolean} props.dropdown - Whether the dropdown is currently open
 * @param {Function} props.setDropdown - Setter to toggle dropdown open/close state
 *
 * @returns {JSX.Element} A dropdown UI for selecting a sorting mode
 */
export default function SortingDropdown({
    options,
    selected,
    handleSelection,
    dropdown,
    setDropdown
}) {
    return (
        <Dropdown
            /* Controlled open/close state */
            openSettings={dropdown}
            setOpenSettings={setDropdown}

            /* Trigger element displayed in the header */
            trigger={
                <span
                    className="flex flex-row py-1 px-2 items-center rounded-full /
                    bg-transparent border-2 border-generic-button-ghost-border 
                    hover:border-generic-button-ghost-border-hover 
                    hover:bg-generic-button-ghost-fill-hover"
                >
                    {/* Dropdown icon */}
                    <Icon className="text-xs">
                        arrow_drop_down
                    </Icon>

                    {/* Currently selected sort label */}
                    <p className="text-xs text-[#F9EDCC] text-nowrap">
                        {selected.label}
                    </p>
                </span>
            }
        >
            {/* Dropdown content: list of selectable sorting options */}
            <div className="flex flex-col space-y-2 w-fit">
                {options.map((o) => {
                    /* Skip rendering the currently selected option */
                    if (o.label === selected.label) {
                        return;
                    }

                    return (
                        <div
                            key={o.label}
                            onClick={() => handleSelection(o)} // Emit selection upward
                            className="cursor-pointer"
                        >
                            <p className="text-xs text-[#F9EDCC] text-nowrap">
                                {o.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </Dropdown>
    );
}