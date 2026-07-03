import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth.js";
import EditPictureModal from "../../components/auth/EditPictureModal.jsx";
import GenericModal from "../../components/GenericModal.jsx";

export default function EditProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [showDelete, setShowDelete] = useState(false);
    const [editPicture, setEditPicture] = useState(false);

    function closeDeleteModal() {
        setShowDelete(false);
    }

    function handleDelete() {
        //delete();
        navigate("/register");
    }

    function handleCancel() {
        navigate("/profile");
    }

    function openDeleteModal() {
        setShowDelete(true);
    }

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

            {editPicture && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <EditPictureModal setEditPicture={setEditPicture} />
                </div>
            )
            }

            <h1 className="text-base md:text-lg text-primary font-bold mb-2">Edit Profile</h1>

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
                <p className="text-xs w-fit">{`${bio.length ? bio.length : (user.bio ? user.bio.length : 0)} / 150`}</p>
            </div>

            <div>
                <button
                    className="text-xs md:text-sm text-primary bg-edit-profile py-3 px-6 md:px-8 rounded-full mr-4 md:mr-6 mb-2 transition-colors hover:bg-edit-profile-hover"
                >
                    Save
                </button>

                <button
                    onClick={openDeleteModal}
                    className="text-xs md:text-sm text-primary bg-view-posts py-3 px-6 md:px-8 rounded-full transition-colors hover:bg-view-posts-hover"
                >
                    Delete
                </button>

                <button
                    onClick={handleCancel}
                    className="py-3 px-6 md:px-8 text-xs md:text-sm rounded-full ml-4 md:ml-6 my-2 border-cancel-stroke border-2 hover:border-tertiary transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}