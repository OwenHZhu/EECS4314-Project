/**
 * EditProfilePage.jsx
 *
 * Profile editing screen allowing users to update:
 * - Username
 * - Bio
 * - Profile picture
 *
 * Dependencies:
 * - useAuth: Provides authenticated user + update() method
 * - validateUsername: Client-side username validation
 * - ProfilePictureModal: Profile picture editing modal
 * - EditProfileHeader: Page header
 * - GenericButton, Icon, ErrorList: Reusable UI components
 *
 * State:
 * - username: Controlled username input
 * - bio: Controlled bio input
 * - messages: Validation or update feedback messages
 * - editPicture: Controls visibility of the picture-edit modal
 */

import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { validateUsername } from "../../utils/validation.js";
import ProfilePictureModal from "./components/ProfilePictureModal.jsx";
import EditProfileHeader from "./components/EditProfileHeader.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";
import Icon from "../../components/generic/Icon.jsx";
import ErrorList from "../../components/generic/ErrorList.jsx";

export default function EditProfilePage() {
    // For displaying error messages 
    const [messages, setMessages] = useState([]);

    // Get user state and update function from AuthProvider
    const { user, update } = useAuth();

    // Controlled input for username
    const [username, setUsername] = useState(user.username);

    // Controlled input for bio
    const [bio, setBio] = useState(user.bio ? user.bio : "");

    // Controls visibility of the profile picture modal
    const [editPicture, setEditPicture] = useState(false);

    /**
     * handleSave()
     *
     * Validates and submits updated profile details.
     *
     * Validation:
     * - Uses validateUsername() to check username rules.
     *
     * Update:
     * - Calls update(username, bio, profile_picture)
     * - Displays backend message regardless of success/failure
     *
     * @returns {Promise<void>}
     */
    async function handleSave() {
        const validationErrors = validateUsername(username);

        // Username validation failed
        if (validationErrors.length >= 1) {
            setMessages([validationErrors]);
            setUsername(user.username);
            setBio(user.bio);
            return;
        }

        // Submit update request
        const res = await update(username, bio, "");

        // If update failed, revert fields to previous values
        if (!res.success) {
            setUsername(user.username);
            setBio(user.bio);
        }

        // Display backend response message
        setMessages([res.message]);
        return;
    }

    /**
     * handlePicture()
     *
     * Toggles the profile picture editing modal.
     *
     * @returns {void}
     */
    function handlePicture() {
        setEditPicture(prev => !prev)
    }

    return (
        <div className="max-w-6xl mx-auto px-8 py-8 md:px-16 md:py-16">
            <title>{`${user.username} | BookAtlas`}</title>

            <EditProfileHeader />

            {/* Profile picture modal */}
            {editPicture && (
                <ProfilePictureModal setEditPicture={setEditPicture} />
            )}

            {/* Username + profile picture */}
            <div className="flex flex-row items-center ml-5">
                <Icon
                    onClick={handlePicture}
                    className="text-6xl md:text-7xl text-[#482828]"
                >
                    account_circle
                </Icon>

                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    maxLength={12}
                    placeholder="What should we call you?"
                    className="bg-[#3A2A2A] text-[#BFB8AD] text-xs md:text-sm focus:outline-none rounded-full p-3 pl-5 ml-1 w-full sm:w-1/2 h-fit"
                />
            </div>

            {/* Error messages */}
            {messages.length >= 1 && (
                <ErrorList
                    className="ml-24"
                    errors={messages}
                />
            )}

            {/* Bio section */}
            <div className="mt-6 mb-6 ml-8 md:mt-8 md:mb-8">
                <h2 className="text-medium text-primary font-bold mb-2">Bio</h2>

                <textarea
                    name="bio"
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    type="text"
                    placeholder="Share something about yourself!"
                    maxLength={150}
                    className="bg-transparent resize-none text-xs md:text-sm border-secondary border-2 focus:ring-0 focus:outline-none rounded-md w-full h-32 md:w-2/3 sm:h-24 p-4"
                />

                {/* Character counter */}
                <p className="text-xs w-fit">
                    {`${bio.length} / 150`}
                </p>
            </div>

            {/* Save button */}
            <GenericButton
                onClick={handleSave}
                variant="primary"
                className="py-3 px-6 md:px-8 ml-8"
            >
                Save
            </GenericButton>
        </div>
    );
}