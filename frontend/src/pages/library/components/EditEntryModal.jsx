/**
 * EditEntryModal.jsx
 *
 * Modal for updating a library entry's status, rating, and favourite flag.
 * Provides:
 * - Status selection via dropdown
 * - Rating selection (for finished/dropped)
 * - Favourite toggle (for finished/dropped)
 * - Save + Cancel actions
 *
 * The parent controls modal visibility through `setEditModal`.
 */

import { useState } from "react";
import EditEntryDropdown from "./EditEntryDropdown";
import StarRating from "./StarRating";
import GenericButton from "../../../components/generic/GenericButton";
import Icon from "../../../components/generic/Icon";
import { useLibraryActions } from "../../../hooks/library/useLibraryActions";

/** Available reading statuses for selection */
const readingStatus = [
    { label: "Finished", variant: "finished" },
    { label: "Reading", variant: "reading" },
    { label: "Wishlist", variant: "wishlist" },
    { label: "Dropped", variant: "dropped" }
];

/**
 * EditEntryModal
 *
 * @param {Object} props
 * @param {Object} props.libraryEntry - The entry being edited
 * @param {string} props.variant - Current status of the entry
 * @param {(open: boolean) => void} props.setEditModal - Controls modal visibility
 *
 * @returns {JSX.Element}
 */
export default function EditEntryModal({ libraryEntry, variant, setEditModal }) {
    /** Selected reading status */
    const [selected, setSelected] = useState(
        readingStatus.find((s) => s.variant === variant)
    );

    /** Dropdown open/close state */
    const [dropdown, setDropdown] = useState(false);

    /** Favourite toggle */
    const [favourite, setFavourite] = useState(false);

    /** Rating value */
    const [rating, setRating] = useState(0);

    /** Variant-specific update action */
    const { doAction } = useLibraryActions();

    /**
     * Update selected status from dropdown.
     */
    function handleSelection(status) {
        setDropdown(false);
        setSelected(status);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="rounded-lg p-6 flex flex-col space-y-3 bg-[#1A2523] border-[#00FFCC] border">
                <h1 className="font-bold text-[#CFE8ED] text-sm md:text-lg">
                    Edit Entry
                </h1>

                {/* Status selection */}
                <div className="flex flex-row space-x-2 items-center">
                    <Icon className="text-[#22C9A8] text-base">steppers</Icon>
                    <h3 className="text-xs md:text-sm text-[#839497] font-semibold">
                        Status:
                    </h3>

                    <EditEntryDropdown
                        options={readingStatus}
                        selected={selected}
                        handleSelection={handleSelection}
                        dropdown={dropdown}
                        setDropdown={setDropdown}
                    />
                </div>

                {/* Rating + favourite only for finished/dropped */}
                {(selected.variant === "dropped" ||
                    selected.variant === "finished") && (
                    <>
                        {/* Rating */}
                        <div className="flex flex-row space-x-2 items-center">
                            <Icon className="text-[#22C9A8] text-base">
                                stars_2
                            </Icon>
                            <h3 className="text-xs md:text-sm text-[#839497] font-semibold">
                                Rating:
                            </h3>

                            <StarRating rating={rating} setRating={setRating} />
                        </div>

                        {/* Favourite toggle */}
                        <div className="flex flex-row space-x-2 items-center">
                            <Icon className="text-[#22C9A8] text-base">
                                favorite
                            </Icon>
                            <h3 className="text-xs md:text-sm text-[#839497] font-semibold">
                                Favourite:
                            </h3>

                            <Icon
                                className="text-[#839497] text-base cursor-pointer"
                                onClick={() => setFavourite((prev) => !prev)}
                            >
                                {favourite
                                    ? "check_box"
                                    : "check_box_outline_blank"}
                            </Icon>
                        </div>
                    </>
                )}

                {/* Action buttons */}
                <div className="flex flex-row space-x-3 items-center">
                    <GenericButton
                        onClick={() =>
                            doAction(
                                libraryEntry,
                                selected.variant,
                                favourite,
                                rating
                            )
                        }
                        variant="secondary"
                        className="text-xs md:text-xs py-1 px-3"
                    >
                        Save
                    </GenericButton>

                    <GenericButton
                        onClick={() => setEditModal((prev) => !prev)}
                        className="text-xs md:text-xs py-1 px-3"
                        variant="ghost"
                    >
                        Cancel
                    </GenericButton>
                </div>
            </div>
        </div>
    );
}