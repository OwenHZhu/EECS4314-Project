import { useState } from "react";
import { validatePassword } from "../../utils/validation.js";
import { useAuth } from "../../context/auth/useAuth.js";
import { useNavigate } from "react-router-dom";
import GenericInput from "../../components/generic/GenericInput.jsx";
import GenericButton from "../../components/generic/GenericButton.jsx";
import GenericModal from "../../components/generic/GenericModal.jsx";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { changePassword, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [cancel, setCancel] = useState(false);
    const [errors, setErrors] = useState([]);

    function handleCancel() {
        navigate("/profile/edit");
    }

    function closeCancelModal() {
        setCancel(false);
    }

    async function updatePassword() {
        const emptyErrors = [];

        // Required-field validation
        if (!currentPassword.trim()) emptyErrors.push("Please enter your current password.");
        if (!newPassword.trim()) emptyErrors.push("Please enter your new password.");

        // If required fields missing: show errors and reset fields
        if (emptyErrors.length > 0) {
            setErrors(emptyErrors);
            setCurrentPassword("");
            setNewPassword("");
            return;
        }

        if (currentPassword === newPassword) {
            setErrors(["New password cannot be the same as the current password."]);
            setCurrentPassword("");
            setNewPassword("");
            return;
        }

        // Format and password strength validation
        let validationErrors = [];
        const passwordErrors = validatePassword(newPassword);

        // Combine all validation errors
        validationErrors = [...validationErrors, ...passwordErrors];

        // If validation fails: show errors and reset fields
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setCurrentPassword("");
            setNewPassword("");
            return;
        }

        // Attempt registration
        const res = await changePassword(currentPassword, newPassword);

        // Backend failure: show server message
        if (!res.success) {
            setErrors([res.message]);
            setCurrentPassword("");
            setNewPassword("");
            return;
        }

        // Successful password change: Logout and navigate to Login page
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

            {/* Delete confirmation modal */}
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
            <p
                className="text-xs md:text-sm text-[#7E7272]"
            >
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
                    <div className="bg-error-bg text-error-text p-3 rounded-lg mb-4 text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Submit and links to login */}
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