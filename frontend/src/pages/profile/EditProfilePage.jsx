/**
 * EditProfilePage.jsx
 *
 * Profile editing screen allowing users to update:
 * - Username
 * - Bio
 * - Profile picture
 *
 * Dependencies:
 * - useAuth: Provides authenticated user data.
 * - useUser: Provides updateProfile(), updateProfilePicture(), and profilePictureUrl.
 * - validateUsername: Client-side username validation.
 * - ProfilePictureModal: Modal for uploading a new profile picture.
 * - EditProfileHeader: Page header UI.
 * - GenericButton, Icon, ErrorList: Reusable UI components.
 */
import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth.js";
import { useUser } from "../../hooks/user/useUser.js";
import { validateUsername } from "../../utils/validation.js";
import ProfilePictureModal from "./components/ProfilePictureModal.jsx";
import EditProfileHeader from "./components/EditProfileHeader.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";
import Icon from "../../components/generic/Icon.jsx";
import ErrorList from "../../components/generic/ErrorList.jsx";

/**
 * EditProfilePage
 *
 * Renders the profile editing interface and handles validation + updates.
 *
 * @returns {JSX.Element}
 */
export default function EditProfilePage() {
    const [messages, setMessages] = useState([]);

    const { user } = useAuth();
    const { updateProfile, profilePictureUrl } = useUser();

    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio ? user.bio : "");
    const [editPicture, setEditPicture] = useState(false);

    /**
     * handleSave()
     *
     * Validates and submits updated profile details.
     *
     * Steps:
     * - Check if the fields are actually different to avoid unnecessary API calls
     * - Validate username using validateUsername()
     * - Submit update request
     * - Revert fields on failure
     * - Display backend response message
     *
     * @async
     * @returns {Promise<void>}
     */
    async function handleSave() {
        if (username === user.username && bio === user.bio) {
            setMessages(["No changes detected."]);
            return; 
        }
        const validationErrors = validateUsername(username);

        if (validationErrors.length >= 1) {
            setMessages([validationErrors]);
            setUsername(user.username);
            setBio(user.bio);
            return;
        }

        const res = await updateProfile(username, bio);

        if (!res.success) {
            setUsername(user.username);
            setBio(user.bio);
        }

        setMessages([res.message]);
    }

    /**
     * handlePicture()
     *
     * Toggles the profile picture editing modal.
     *
     * @returns {void}
     */
    function handlePicture() {
        setEditPicture(prev => !prev);
    }

    return (
        <div className="max-w-6xl mx-auto px-8 py-8 md:px-16 md:py-16">
            <title>{`${user.username} | BookAtlas`}</title>

            <EditProfileHeader />

            {/* Profile picture modal */}
            {editPicture && (
                <ProfilePictureModal
                    setEditPicture={setEditPicture}
                    setMessages={setMessages}
                />
            )}

            {/* Username and profile picture */}
            <div className="flex flex-row items-center ml-5 mt-2">

                {/**
                 * Profile Picture Rendering
                 *
                 * Displays either:
                 * - A default icon when no profile picture is available.
                 * - The user's profile picture when profilePictureUrl is present.
                 *
                 * profilePictureUrl is provided by useUser() and updates whenever:
                 * - The user changes their profile picture.
                 * - The page reloads and the provider refetches the image.
                 */}
                {(!profilePictureUrl) && (
                    <Icon
                        onClick={handlePicture}
                        className="text-6xl md:text-7xl text-[#482828]"
                    >
                        account_circle
                    </Icon>
                )}

                {profilePictureUrl && (
                    <img
                        onClick={handlePicture}
                        src={profilePictureUrl}
                        alt={`${user.username}'s profile picture`}
                        className="rounded-full w-12 h-12 md:w-14 md:h-14 mr-2"
                    />
                )}

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