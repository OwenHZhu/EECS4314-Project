import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_USER } from "../../data/mockUser";
import DeleteAccountModal from "../../components/auth/DeleteAccountModal";

export default function EditProfilePage() {
    const user = MOCK_USER;
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [showDelete, setShowDelete] = useState(false);

    function handleCancel() {
        navigate("/profile");
    }

    function handleDelete() {
        if (!showDelete) {
            setShowDelete(true);
        }
        else {
            setShowDelete(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-16 py-16">
            {showDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <DeleteAccountModal setShowDelete={setShowDelete} />
                </div>
            )}

            <h1 className="text-lg text-primary font-bold mb-2">Edit Profile</h1>

            <div className="flex flex-row px-6 py-6 bg-container-fill border-input-stroke border-2 rounded-md">
                <div className="w-16 h-16 rounded-full bg-[#2d2845] flex items-center justify-center text-2xl font-semibold text-[#b8b0ff] shrink-0">
                    {user.username[0]}
                </div>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    maxLength={12}
                    placeholder={user.username}
                    className="bg-background text-sm focus:outline-none rounded-full p-4 ml-2 mt-2 w-1/2 h-fit"
                />
            </div>

            <div className="mt-8 mb-8">
                <h2 className="text-md text-primary font-bold mb-2">Bio</h2>
                <textarea
                    name="bio"
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    type="text"
                    placeholder={user.bio}
                    maxLength={150}
                    className="bg-transparent resize-none text-sm border-secondary border-2 focus:ring-0 focus:outline-none rounded-md w-2/3 h-2/3 p-4"
                />
                <p className="text-xs w-1/5">{`${bio.length ? bio.length : user.bio.length} / 150`}</p>
            </div>

            <div>
                <button
                    className="text-sm text-primary bg-edit-profile py-3 px-8 rounded-full mr-6 mb-2 transition-colors hover:bg-edit-profile-hover"
                >
                    Save
                </button>

                <button
                    onClick={handleDelete}
                    className="text-sm text-primary bg-view-posts py-3 px-8 rounded-full transition-colors hover:bg-view-posts-hover"
                >
                    Delete Account
                </button>

                <button
                    onClick={handleCancel}
                    className="py-3 px-8 text-sm rounded-full mx-4 my-2 border-cancel-stroke border-2 hover:border-tertiary transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}