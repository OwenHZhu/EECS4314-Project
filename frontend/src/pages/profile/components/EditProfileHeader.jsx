/**
 * EditProfileHeader.jsx
 *
 * Header component for the Edit Profile page. Handles:
 * - Triggering the discard‑changes modal when navigating back
 * - Triggering the delete‑account modal from the settings dropdown
 * - Opening/closing the settings dropdown
 * - Disabling the settings icon and dropdown when discardChanges is active
 *
 * State:
 * @param {boolean} openSettings - Controls visibility of the settings dropdown.
 * @param {boolean} showDelete - Controls visibility of the delete-account modal.
 * @param {boolean} discardChanges - Controls visibility of the discard-changes modal.
 *
 * Dependencies:
 * - useNavigate: Routing to profile and change-password pages.
 * - Dropdown: Reusable dropdown menu component.
 * - Icon: Google Material Symbols icon component.
 * - DeleteAccountModal: Modal for confirming account deletion.
 * - DiscardChangesModal: Modal for confirming discard of unsaved edits.
 *
 * Notes:
 * - When discardChanges is true, the settings icon becomes disabled and cannot open the dropdown.
 * - Opening any modal automatically closes the settings dropdown for safety and clarity.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Dropdown from "../../../components/generic/Dropdown.jsx";
import Icon from "../../../components/generic/Icon.jsx";
import DeleteAccountModal from "./modals/DeleteAccountModal.jsx";
import DiscardChangesModal from "./modals/DiscardChangesModal.jsx"

export default function EditProfileHeader() {
    const navigate = useNavigate();

    // Controls visibility of the settings dropdown
    const [openSettings, setOpenSettings] = useState(false);

    // Controls visibility of the delete-account modal
    const [showDelete, setShowDelete] = useState(false);

    // Controls visibility of the discard-changes modal
    const [discardChanges, setDiscardChanges] = useState(false);

    /**
     * Opens the delete-account modal and closes the settings dropdown.
     *
     * @returns {void}
     */
    function handleDelete() {
        setOpenSettings(false);
        setShowDelete(true);
    }

    /**
     * Opens the discard-changes modal and closes the settings dropdown.
     *
     * @returns {void}
     */
    function openDiscardChanges() {
        setOpenSettings(false);
        setDiscardChanges(true);
    }

    return (
        <header className="flex flex-row items-center space-x-1">

            {/* Delete Account Modal */}
            {showDelete && (
                <DeleteAccountModal setShowDelete={setShowDelete} />
            )}

            {/* Discard Changes Modal */}
            {discardChanges && (
                <DiscardChangesModal setDiscardChanges={setDiscardChanges} />
            )}

            {/* Back arrow → triggers discard-changes modal */}
            <Icon
                onClick={openDiscardChanges}
                className="text-[#5A4B4B]"
            >
                arrow_back
            </Icon>

            {/* Page title */}
            <h1 className="font-semibold text-[#BFB8AD] text-sm md:text-lg">
                Edit Profile
            </h1>

            {/* Settings dropdown (disabled when discardChanges is true) */}
            <Dropdown
                openSettings={openSettings}
                setOpenSettings={discardChanges ? () => {} : setOpenSettings}
                trigger={
                    <Icon
                        className={
                            discardChanges
                                ? "text-[#5A4B4B] opacity-40 cursor-not-allowed mt-1.5"
                                : "text-[#482828] mt-1.5"
                        }
                        onClick={
                            discardChanges
                                ? undefined
                                : () => setOpenSettings(!openSettings)
                        }
                    >
                        settings
                    </Icon>
                }
            >
                {/* Delete Account option */}
                <div
                    onClick={handleDelete}
                    className="flex flex-row items-center space-x-2 cursor-pointer mb-1"
                >
                    <Icon className="text-[#238874] text-xl md:text-2xl">
                        delete
                    </Icon>
                    <p className="text-xs text-[#839497] text-nowrap hidden sm:block">
                        Delete Account
                    </p>
                </div>

                {/* Change Password option */}
                <div>
                    <div
                        onClick={() => navigate("/change-password")}
                        className="flex flex-row items-center space-x-2 cursor-pointer"
                    >
                        <Icon className="text-[#238874] text-xl md:text-2xl">
                            key
                        </Icon>
                        <p className="text-xs text-[#839497] text-nowrap hidden sm:block">
                            Change Password
                        </p>
                    </div>
                </div>
            </Dropdown>
        </header>
    );
}