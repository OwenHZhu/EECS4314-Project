import { useState } from "react";
import EditEntryDropdown from "./EditEntryDropdown";
import StarRating from "./StarRating";
import GenericButton from "../../../components/generic/GenericButton";
import Icon from "../../../components/generic/Icon";
import { useLibraryActions } from "../../../hooks/library/useLibraryActions";

const readingStatus = [
    { label: "Finished", variant: "finished" },
    { label: "Reading", variant: "reading" },
    { label: "Wishlist", variant: "wishlist" },
    { label: "Dropped", variant: "dropped" },
]

export default function EditEntryModal({ libraryEntry, variant, setEditModal }) {
    const [selected, setSelected] = useState(readingStatus.find((s) => s.variant === variant));
    const [dropdown, setDropdown] = useState(false);
    const [favourite, setFavourite] = useState(false);
    const [rating, setRating] = useState(0);
    const { doAction } = useLibraryActions();
    console.log(libraryEntry.book.title, selected.variant, rating, favourite);

    function handleSelection(status) {
        setDropdown(false);
        setSelected(status);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div
                className="rounded-lg p-6 flex flex-col space-y-3 bg-[#1A2523] border-[#00FFCC] border"
            >
                <h1 className="font-bold text-[#CFE8ED] text-sm md:text-lg">Edit Entry</h1>

                <div className="flex flex-row space-x-2 items-center">
                    <Icon
                        className="text-[#22C9A8] text-base"
                    >
                        steppers
                    </Icon>
                    <h3 className="text-xs md:text-sm text-[#839497] font-semibold">Status:</h3>
                    <EditEntryDropdown
                        options={readingStatus}
                        selected={selected}
                        handleSelection={handleSelection}
                        dropdown={dropdown}
                        setDropdown={setDropdown}
                    />
                </div>

                {/* {
                    !(selected.variant === "wishlist") && (
                        <div className="flex flex-row space-x-2 items-center">
                            <Icon
                                className="text-[#22C9A8] text-base"
                            >
                                calendar_today
                            </Icon>
                            <h3 className="text-xs md:text-sm text-[#839497] font-semibold">Started:</h3>
                            <p className="text-xs md:text-sm text-[#839497]">
                                {format(libraryEntry.added_at, "MMM d, yyy")}
                            </p>
                        </div>
                    )
                } */}

                {
                    (selected.variant === "dropped" || selected.variant === "finished") &&
                    (
                        <>
                            {/* <div className="flex flex-row space-x-2 items-center">
                                <Icon
                                    className="text-[#22C9A8] text-base"
                                >
                                    calendar_check
                                </Icon>
                                <h3 className="text-xs md:text-sm text-[#839497] font-semibold">Finished:</h3>
                                <p className="text-xs md:text-sm text-[#839497]">
                                    {format(libraryEntry.updated_at, "MMM d, yyy")}
                                </p>
                            </div> */}

                            <div className="flex flex-row space-x-2 items-center">
                                <Icon
                                    className="text-[#22C9A8] text-base"
                                >
                                    stars_2
                                </Icon>
                                <h3 className="text-xs md:text-sm text-[#839497] font-semibold">Rating:</h3>
                                <StarRating
                                    rating={rating}
                                    setRating={setRating}
                                />
                            </div>

                            <div className="flex flex-row space-x-2 items-center">
                                <Icon
                                    className="text-[#22C9A8] text-base"
                                >
                                    favorite
                                </Icon>
                                <h3 className="text-xs md:text-sm text-[#839497] font-semibold">Favourite:</h3>
                                <Icon
                                    className="text-[#839497] text-base"
                                    onClick={() => setFavourite(prev => !prev)}
                                >
                                    {favourite ? "check_box" : "check_box_outline_blank"}
                                </Icon>
                            </div>
                        </>
                    )
                }

                {/* Action buttons */}
                <div className="flex flex-row space-x-3 items-center">
                    <GenericButton
                        onClick={() => doAction(libraryEntry, selected.variant, favourite, rating)}
                        variant="secondary"
                        className="text-xs md:text-xs py-1 px-3"
                    >
                        Save
                    </GenericButton>

                    <GenericButton
                        onClick={() => setEditModal(prev => !prev)}
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