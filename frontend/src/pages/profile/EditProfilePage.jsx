/**
 * ./pages/profile/EditProfilePage.jsx
 *
 * The profile editing screen where users can update personal information and
 * manage account-related actions. This page provides functionality for:
 *
 * 1. **Editing profile details**
 *    - Username: Users can enter a new username (max 12 characters).
 *    - Bio: Users can update their personal bio (max 150 characters).
 *    - Profile picture: Clicking the avatar opens a modal for picture editing.
 *
 * 2. **Account management**
 *    - Delete account: Opens a confirmation modal before proceeding.
 *    - Cancel editing: Returns the user to the profile page without saving.
 *
 * 3. **Modal interactions**
 *    - `GenericModal`: Used for delete-account confirmation.
 *    - `EditPictureModal`: Used for editing the profile picture.
 *
 * Dependencies:
 * - `useAuth`: Provides the authenticated user object.
 * - `useNavigate`: Handles navigation after delete/cancel actions.
 * - `EditPictureModal`: Modal for updating the profile picture.
 * - `GenericModal`: Reusable confirmation modal.
 * - `GenericButton`: Reusable button component.
 *
 * State:
 * - `username`: Controlled input for the new username.
 * - `bio`: Controlled input for the new bio.
 * - `showDelete`: Controls visibility of the delete confirmation modal.
 * - `editPicture`: Controls visibility of the profile picture editing modal.
 *
 * Behaviour:
 * - Clicking the profile picture toggles the picture-edit modal.
 * - Clicking "Delete" opens a confirmation modal.
 * - Confirming delete redirects to `/register` (placeholder behavior).
 * - Clicking "Cancel" returns to `/profile`.
 * - Clicking "Save" currently does not persist changes (placeholder).
 *
 * Notes:
 * - No backend integration is present yet; delete and save actions are placeholders.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth.js";
import EditPictureModal from "../../components/auth/EditPictureModal.jsx";
import GenericModal from "../../components/generic/GenericModal.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";

export default function EditProfilePage() {
    const { user, deleteAccount, update } = useAuth();
    const navigate = useNavigate();

    // Controlled input for new username
    const [username, setUsername] = useState("");

    // Controlled input for new bio
    const [bio, setBio] = useState("");

    // Controls visibility of the delete confirmation modal
    const [showDelete, setShowDelete] = useState(false);

    // Controls visibility of the profile picture editing modal
    const [editPicture, setEditPicture] = useState(false);

    // Close the delete confirmation modal
    function closeDeleteModal() {
        setShowDelete(false);
    }

    /**
     * Delete's the user's account and redirects them to the register page
     */
    function handleDelete() {
        deleteAccount();
        navigate("/register");
    }

    /**
     * Save new profile details 
     * TO-DO: Add visible error handling for if a user enters an invalid username
     */
    function handleSave() {
        update(username, bio, "");
    }

    /** Cancel editing and return to the profile page */
    function handleCancel() {
        navigate("/profile");
    }

    /** Open the delete confirmation modal */
    function openDeleteModal() {
        setShowDelete(true);
    }

    /**
     * handlePicture()
     *
     * Toggles the profile picture editing modal.
     */
    function handlePicture() {
        if (!editPicture) {
            setEditPicture(true);
        }
        else {
            setEditPicture(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-8 py-8 md:px-16 md:py-16">
            <title>{`${user.username} | BookAtlas`}</title>

            {/* Delete confirmation modal */}
            {showDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <GenericModal
                        title="Delete Account?"
                        confirmLabel="Confirm"
                        cancelLabel="Cancel"
                        onConfirm={handleDelete}
                        onCancel={closeDeleteModal}
                    />
                </div>
            )}

            {/* Edit picture modal */}
            {editPicture && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <EditPictureModal setEditPicture={setEditPicture} />
                </div>
            )}

            <h1 className="text-base md:text-lg text-primary font-bold mb-2">Edit Profile</h1>

            {/* Username and profile picture section */}
            <div className="flex flex-row px-4 py-4 md:px-6 md:py-6 bg-container-fill border-input-stroke border-2 rounded-md">
                <div
                    onClick={handlePicture}
                    className="w-12 h-12 md:w-16 md:h-16 cursor-pointer rounded-full bg-[#2d2845] flex items-center justify-center text-lg md:text-2xl font-semibold text-[#b8b0ff] shrink-0"
                >
                    {user.username[0]}
                </div>

                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    maxLength={12}
                    placeholder={user.username}
                    className="bg-background text-xs md:text-sm focus:outline-none rounded-full p-4 ml-2 mt-1 md:mt-2 w-full sm:w-1/2 h-fit"
                />
            </div>

            {/* Bio section */}
            <div className="mt-6 mb-6 md:mt-8 md:mb-8">
                <h2 className="text-base md:text-lg text-primary font-bold mb-2">Bio</h2>

                <textarea
                    name="bio"
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    type="text"
                    placeholder={user.bio ? user.bio : ""}
                    maxLength={150}
                    className="bg-transparent resize-none text-xs md:text-sm border-secondary border-2 focus:ring-0 focus:outline-none rounded-md w-full h-32 md:w-2/3 sm:h-24 p-4"
                />

                {/* Character counter */}
                <p className="text-xs w-fit">
                    {`${bio.length ? bio.length : (user.bio ? user.bio.length : 0)} / 150`}
                </p>
            </div>

            {/* Action buttons */}
            <div>
                <GenericButton
                    onClick={handleSave}
                    variant="primary"
                    className="py-3 px-6 md:px-8 mr-4 md:mr-6 mb-2"
                >
                    Save
                </GenericButton>

                <GenericButton
                    onClick={openDeleteModal}
                    variant="secondary"
                    className="py-3 px-6 md:px-8 mr-4 md:mr-6 mb-2"
                >
                    Delete
                </GenericButton>

                <GenericButton
                    onClick={handleCancel}
                    variant="ghost"
                    className="py-3 px-6 md:px-8 mr-4 md:mr-6 mb-2"
                >
                    Cancel
                </GenericButton>
            </div>
        </div>
    );
}