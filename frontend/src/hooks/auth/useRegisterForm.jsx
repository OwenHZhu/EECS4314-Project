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
     * validateRequired()
     * Performs required-field checks using current form state.
     *
     * @returns {string[]} Missing-field error messages.
     */
    function validateRequired() {
        const missing = [];

        if (!username.trim()) missing.push("Please enter your username.");
        if (!email.trim()) missing.push("Please enter your email.");
        if (!password.trim()) missing.push("Please enter your password.");

        return missing;
    }

    /**
     * validateFormat()
     * Performs format/strength validation using current form state.
     * Runs only after required fields are present.
     *
     * @returns {string[]} Format/strength validation errors.
     */
    function validateFormat() {
        const formatErrors = [];

        // Username rules
        formatErrors.push(...validateUsername(username));

        // Email format
        if (!validateEmail(email)) {
            formatErrors.push("Invalid email.");
        }

        // Password strength rules
        formatErrors.push(...validatePassword(password));

        return formatErrors;
    }

    /**
     * handleSubmit()
     * Runs:
     * 1. Required-field validation
     * 2. Format validation
     * 3. Registration request
     * 4. Navigation + cleanup on success
     *
     * @returns {Promise<void>}
     */
    async function handleSubmit() {
        // Stage 1: Required fields
        const requiredErrors = validateRequired();
        if (requiredErrors.length > 0) {
            setErrors(requiredErrors);
            return;
        }

        // Stage 2: Format rules
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