/**
 * ProfilePictureModal.jsx
 *
 * Modal for managing profile picture actions. Provides options to:
 * - Upload a new profile photo
 * - Remove the existing profile photo
 * - Close the modal
 *
 * Props:
 * @param {function} setEditPicture - State setter used to hide the modal.
 *
 * Dependencies:
 * - Icon: Google Material Symbols icon component.
 *
 * Notes:
 * - Upload and remove actions are placeholders and require backend integration.
 */

import Icon from "../../../components/generic/Icon.jsx"

export default function ProfilePictureModal({ setEditPicture }) {
    /**
     * close()
     *
     * Closes the profile picture modal.
     *
     * @returns {void}
     */
    function close() {
        setEditPicture(false);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col space-y-2 font-bold items-center bg-[#1A2523] border-[#3A8173] rounded-md border-2 p-8 max-w-fit">
                <h1 className="text-sm text-[#CFE8ED] md:text-lg">Change Profile Photo</h1>

                {/* Upload photo (placeholder) */}
                <div className="cursor-pointer flex flex-row space-x-1 items-center">
                    <Icon className="text-[#238874] text-2xl">
                        upload
                    </Icon>
                    <p className="text-[#839497] text-xs md:text-sm">Upload</p>
                </div>

                {/* Remove photo (placeholder) */}
                <div className="cursor-pointer flex flex-row space-x-1 items-center">
                    <Icon className="text-[#238874] text-2xl">
                        scan_delete
                    </Icon>
                    <p className="text-[#839497] text-xs md:text-sm">Remove</p>
                </div>

                {/* Close modal */}
                <div
                    onClick={close}
                    className="cursor-pointer flex flex-row space-x-1 items-center"
                >
                    <Icon className="text-[#238874] text-2xl">
                        close
                    </Icon>
                    <p className="text-[#839497] text-xs md:text-sm">Close</p>
                </div>
            </div>
        </div>
    );
}