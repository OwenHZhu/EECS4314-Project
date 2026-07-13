/**
 * ChangePasswordPage.jsx
 *
 * Page for updating the user's password. Handles:
 * - Required-field validation
 * - Password strength validation
 * - Backend password update
 * - Logout + redirect after successful change
 *
 * Dependencies:
 * - useAuth: Provides changePassword() and logout()
 * - useNavigate: Navigation after cancel or success
 * - validatePassword: Client-side password strength validation
 * - GenericInput, GenericButton, GenericModal, ErrorList: Reusable UI components
 */

import { useState } from "react";
import { validatePassword } from "../../utils/validation.js";
import { useAuth } from "../../context/auth/useAuth.js";
import { useNavigate } from "react-router-dom";
import GenericInput from "../../components/generic/GenericInput.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";
import GenericModal from "../../components/generic/GenericModal.jsx";
import ErrorList from "../../components/generic/ErrorList.jsx";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { changePassword, logout } = useAuth();

    // Controlled inputs for password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Controls visibility of cancel confirmation modal
    const [cancel, setCancel] = useState(false);

    // Validation + backend error messages
    const [errors, setErrors] = useState([]);

    /**
     * handleCancel()
     *
     * Navigates back to the profile editing page.
     *
     * @returns {void}
     */
    function handleCancel() {
        navigate("/profile/edit");
    }

    /**
     * closeCancelModal()
     *
     * Closes the cancel confirmation modal.
     *
     * @returns {void}
     */
    function closeCancelModal() {
        setCancel(false);
    }

    /**
     * handleErrors()
     *
     * Handles the display of validation or backend errors and resets both password fields.
     *
     * @param {string[]} errors - Array of error messages to display
     * @returns {void}
     */
    function handleErrors(errors) {
        setErrors(errors);
        setCurrentPassword("");
        setNewPassword("");
    }

    /**
     * updatePassword()
     *
     * Validates and submits a password change request.
     *
     * Validation steps:
     * - Required fields must be filled
     * - New password must differ from current password
     * - New password must pass validatePassword() rules
     *
     * Backend:
     * - Calls changePassword(currentPassword, newPassword)
     * - On failure: displays backend message
     * - On success: logs out user and redirects to login
     *
     * @returns {Promise<void>}
     */
    async function updatePassword() {
        const emptyErrors = [];

        // Required-field validation
        if (!currentPassword.trim()) emptyErrors.push("Please enter your current password.");
        if (!newPassword.trim()) emptyErrors.push("Please enter your new password.");

        // Missing required fields
        if (emptyErrors.length > 0) {
            handleErrors(emptyErrors);
            return;
        }

        // Prevent identical passwords
        if (currentPassword === newPassword) {
            handleErrors(["New password cannot be the same as the current password."]);
            return;
        }

        // Password strength validation
        const passwordErrors = validatePassword(newPassword);

        if (passwordErrors.length > 0) {
            handleErrors(passwordErrors);
            return;
        }

        // Attempt password update
        const res = await changePassword(currentPassword, newPassword);

        // Backend failure
        if (!res.success) {
            handleErrors([res.message]);
            return;
        }

        // Successful password change → logout + redirect
        logout();
        navigate("/login");

        // Clear UI state
        setCurrentPassword("");
        setNewPassword("");
        setErrors([]);
    }

    return (
        <section className="mx-auto my-auto justify-center align-middle max-w-md p-8 md:p-10">
            <title>Change Password | BookAtlas</title>

            {/* Cancel confirmation modal */}
            {cancel && (
                <GenericModal
                    title="Cancel Password Change?"
                    confirmLabel="Confirm"
                    cancelLabel="Cancel"
                    onConfirm={handleCancel}
                    onCancel={closeCancelModal}
                />
            )}

            <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary">
                Change Password
            </h1>

            <p className="text-xs md:text-sm text-[#7E7272]">
                Note: You must login after this action.
            </p>

            <form
                noValidate
                className="flex flex-col mt-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    updatePassword();
                }}
            >
                {/* Current password input */}
                <GenericInput
                    type="password"
                    placeholder="Current Password"
                    variant="auth"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="p-2 sm:p-3 mb-3"
                />

                {/* New password input */}
                <GenericInput
                    type="password"
                    placeholder="New Password"
                    variant="auth"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="p-2 sm:p-3 mb-3"
                />

                {/* Error messages */}
                {errors.length > 0 && (
                    <ErrorList errors={errors} />
                )}

                {/* Submit + cancel */}
                <div className="flex flex-row mt-2 justify-center space-x-3">
                    <GenericButton
                        type="submit"
                        variant="primary"
                        className="py-2 px-8 text-xs md:text-sm"
                    >
                        Confirm
                    </GenericButton>

                    <GenericButton
                        onClick={() => setCancel(true)}
                        variant="ghost"
                        className="py-2 px-8 text-xs md:text-sm"
                    >
                        Cancel
                    </GenericButton>
                </div>
            </form>
        </section>
    );
}