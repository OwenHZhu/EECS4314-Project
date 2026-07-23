/**
 * ./hooks/auth/useRegisterForm.js
 *
 * Manages registration form state, validation, submission, and navigation.
 *
 * Dependencies:
 * - useNavigate: Redirects to /profile on success.
 * - useAuth.register(): Performs backend registration.
 * - validateEmail / validatePassword / validateUsername: Field-level validation.
 *
 * Returns:
 * - Controlled fields: username, email, password
 * - UI state: isLoading, errors
 * - Setters: setUsername, setEmail, setPassword
 * - handleSubmit(): Runs validation + registration flow
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { validateEmail, validatePassword, validateUsername } from "../../utils/validation";

export function useRegisterForm() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Controlled form fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    /**
     * validateFormat()
     * Performs required field and format/strength validation using current form state.
     *
     * @returns {string[]} Format/strength validation errors.
     */
    function validateFormat() {
        const formatErrors = [];

        // Username rules
        const usernameErrors = validateUsername(username);
        if (usernameErrors.length > 0) {
            formatErrors.push(...usernameErrors);
        }

        // Email rules
        const emailErrors = validateEmail(email);
        if (emailErrors.length > 0) {
            formatErrors.push(...emailErrors);
        }

        // Password rules
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            formatErrors.push(...passwordErrors);
        }

        return formatErrors;
    }

    /**
     * handleSubmit()
     * Runs:
     * 1. Required-field and format validation
     * 3. Registration request
     * 4. Navigation + cleanup on success
     *
     * @returns {Promise<void>}
     */
    async function handleSubmit() {
        const formatErrors = validateFormat();
        if (formatErrors.length > 0) {
            setErrors(formatErrors);
            return;
        }

        // Registration attempt
        setIsLoading(true);
        const res = await register(username, email, password);
        setIsLoading(false);

        // Backend failure
        if (!res.success) {
            setErrors([res.message]);
            return;
        }

        // Success: navigate + clear state
        navigate("/profile");
        setUsername("");
        setEmail("");
        setPassword("");
        setErrors([]);
    }

    return {
        username,
        email,
        password,
        isLoading,
        errors,
        setEmail,
        setUsername,
        setPassword,
        handleSubmit,
    };
}