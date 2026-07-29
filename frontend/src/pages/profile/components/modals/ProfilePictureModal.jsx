/**
 * ProfilePictureModal.jsx
 *
 * Modal for managing profile picture actions. Provides options to:
 * - Upload a new profile photo
 * - Remove the existing profile photo (placeholder)
 * - Close the modal
 *
 * Props:
 * @param {function} setEditPicture - Toggles modal visibility.
 * @param {function} setMessages - Displays success or error messages.
 *
 * Dependencies:
 * - useUser: Provides updateProfilePicture() for uploading a new profile picture.
 * - Icon: Google Material Symbols icon component.
 *
 * Notes:
 * - Upload uses FormData and updateProfilePicture().
 * - Remove action is currently a placeholder.
 */

import { useState, useRef } from "react";
import { useUser } from "../../../../hooks/user/useUser.js";
import Icon from "../../../../components/generic/Icon.jsx";

export default function ProfilePictureModal({ setMessages, setEditPicture }) {
    const { updateProfilePicture } = useUser();
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);

    /**
     * close()
     *
     * Closes the profile picture modal.
     * @returns {void}
     */
    function close() {
        setEditPicture(false);
    }

    /**
     * handleFileUpload()
     *
     * Handles uploading a new profile picture.
     * Converts the selected file into FormData and sends it to updateProfilePicture().
     * Displays backend response messages and closes the modal afterward.
     *
     * @async
     * @param {Event} event - File input change event containing the selected file.
     * @returns {Promise<void>}
     */
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("profile_picture", file);

        setIsLoading(true);
        const res = await updateProfilePicture(formData);
        setIsLoading(false);
        setMessages([res.message]);

        close();
    }

    /**
     * openFilePicker()
     * 
     * Triggers the hidden file input element
     * @returns {void}
     */
    function openFilePicker() {
        fileInputRef.current.click();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col space-y-2 font-bold items-center bg-[#1A2523] border-[#3A8173] rounded-md border-2 p-8 max-w-fit">
                <h1 className="text-sm text-[#CFE8ED] md:text-lg">Change Profile Photo</h1>

                <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {/* Upload photo */}
                <div
                    className="cursor-pointer flex flex-row space-x-1 items-center"
                    onClick={openFilePicker}
                >
                    <Icon className="text-[#238874] text-2xl">
                        upload
                    </Icon>
                    <p className="text-[#839497] text-xs md:text-sm">
                        {isLoading ? "Uploading..." : "Upload"}
                    </p>
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