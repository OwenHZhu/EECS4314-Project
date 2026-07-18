import Dropdown from "../../../components/generic/Dropdown";
import Icon from "../../../components/generic/Icon";

export default function EditEntryDropdown({
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