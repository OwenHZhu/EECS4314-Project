import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Dropdown from "../../components/generic/Dropdown";
import Icon from "../../components/generic/Icon";
import DeleteAccountModal from "./DeleteAccountModal.jsx";
import DiscardChangesModal from "./DiscardChangesModal.jsx"

export default function EditProfileHeader() {
    const navigate = useNavigate();
    const [openSettings, setOpenSettings] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [discardChanges, setDiscardChanges] = useState(false);

    function handleDelete() {
        setOpenSettings(false);
        setShowDelete(true);
    }

    return (
        <header className="flex flex-row items-center space-x-1">
            {/* Delete confirmation modal */}
            {showDelete && (
                <DeleteAccountModal
                    setShowDelete={setShowDelete}
                />
            )}

            {/* Back to profile modal */}
            {discardChanges && (
                <DiscardChangesModal
                    setDiscardChanges={setDiscardChanges}
                />
            )}

            <Icon
                onClick={() => setDiscardChanges(true)}
                className="text-[#5A4B4B]"
            >
                arrow_back
            </Icon>

            <h1
            className="font-semibold text-[#BFB8AD] text-sm md:text-lg"
            >
                Edit Profile
            </h1>

            <Dropdown
                openSettings={openSettings}
                setOpenSettings={setOpenSettings}
                trigger={
                    <Icon
                        className="text-[#482828] mt-1.5"
                    >
                        settings
                    </Icon>}
            >
                {/* Row 1: Delete Account */}
                <div
                    onClick={handleDelete}
                    className="flex flex-row items-center space-x-2 cursor-pointer mb-1"
                >
                    <Icon
                        className="text-[#238874] text-xl md:text-2xl"
                    >
                        delete
                    </Icon>
                    <p className="text-xs text-[#839497] text-nowrap hidden sm:block">Delete Account</p>
                </div>
                {/* Row 2: Change Password */}
                <div>
                    <div
                        onClick={() => navigate("/change-password")}
                        className="flex flex-row items-center space-x-2 cursor-pointer"
                    >
                        <Icon
                            className="text-[#238874] text-xl md:text-2xl"
                        >
                            key
                        </Icon>
                        <p className="text-xs text-[#839497] text-nowrap hidden sm:block">Change Password</p>
                    </div>
                </div>
            </Dropdown>
        </header>
    );
}