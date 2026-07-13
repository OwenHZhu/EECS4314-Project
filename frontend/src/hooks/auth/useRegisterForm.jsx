import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { validateEmail, validatePassword, validateUsername } from "../../utils/validation";

export function useRegisterForm() {
    const navigate = useNavigate();
    const { register } = useAuth();

    // Form fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Validation + backend errors
    const [errors, setErrors] = useState([]);

    /**
     * validateRequired()
     *
     * Stage 1: Required-field validation only.
     * Returns an array of missing-field errors.
     */
    function validateRequired({ username, email, password }) {
        const missing = [];

        if (!username.trim()) missing.push("Please enter your username.");
        if (!email.trim()) missing.push("Please enter your email.");
        if (!password.trim()) missing.push("Please enter your password.");

        return missing;
    }

    /**
     * validateFormat()
     *
     * Stage 2: Format/strength validation.
     * Only runs when all required fields are present.
     */
    function validateFormat({ username, email, password }) {
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
     *
     * Runs two-stage validation, attempts registration,
     * and handles success/failure responses.
     */
    async function handleSubmit() {
        // Stage 1: Required fields
        const requiredErrors = validateRequired({ username, email, password });

        if (requiredErrors.length > 0) {
            setErrors(requiredErrors);
            return;
        }

        // Stage 2: Format/strength validation
        const formatErrors = validateFormat({ username, email, password });

        if (formatErrors.length > 0) {
            setErrors(formatErrors);
            return;
        }

        // Attempt registration
        setIsLoading(true);
        const res = await register(username, email, password);
        setIsLoading(false);

        // Backend failure
        if (!res.success) {
            setErrors([res.message]);
            return;
        }

        // Successful registration → navigate
        navigate("/profile");

        // Clear UI state on success only
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