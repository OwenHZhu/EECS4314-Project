/**
 * ./pages/auth/LoginPage.jsx
 *
 * The login screen for the application. Handles:
 * - User input for email and password
 * - Client-side validation
 * - Authentication via the `login` function from useAuth()
 * - Displaying redirect messages (e.g., from protected routes)
 * - Navigating to the profile page on successful login
 *
 * Dependencies:
 * - useNavigate (react-router-dom): Redirects the user after login.
 * - validateEmail: Utility function for email format validation.
 * - useAuth: Provides login(), redirectMessage, and setRedirectMessage().
 * - GenericButton: Reusable button component.
 *
 * State:
 * - email: User's email input
 * - password: User's password input
 * - errors: Array of validation or login errors
 *
 * Behaviour:
 * - Validates inputs before attempting login.
 * - Clears redirect messages when new errors occur.
 * - On successful login: navigates to /profile.
 * - On failure: displays error messages and resets inputs.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import { useAuth } from "../../context/auth/useAuth";
import GenericButton from "../../components/generic/GenericButton";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, redirectMessage, setRedirectMessage } = useAuth();

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Validation and login errors
    const [errors, setErrors] = useState([]);

    /**
     * loginUser()
     *
     * Handles form submission:
     * - Validates email and password
     * - Calls login(email, password)
     * - Handles success/failure responses
     *
     * @returns {Promise<void>}
     */
    async function loginUser() {
        const newErrors = [];

        // Basic required-field validation
        if (!email.trim()) {
            newErrors.push("Please enter your email.");
        }
        if (!password.trim()) {
            newErrors.push("Please enter your password.");
        }

        // Email format validation
        if (email && !validateEmail(email)) {
            newErrors.push("Please enter a valid email address.");
        }

        // If validation fails: show errors and reset fields
        if (newErrors.length > 0) {
            setRedirectMessage(null);
            setErrors(newErrors);
            setEmail("");
            setPassword("");
            return;
        }

        // Attempt login
        const res = await login(email, password);

        // If login fails: show backend error message
        if (!res.success) {
            setRedirectMessage(null);
            setErrors([res.message]);
            setEmail("");
            setPassword("");
            return;
        }

        // Successful login: navigate to profile
        navigate("/profile");

        // Clear UI state
        setRedirectMessage(null);
        setEmail("");
        setPassword("");
        setErrors([]);
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10">
            <title>Login | BookAtlas</title>

            {/* Left marketing section */}
            <section className="pt-8 pl-8 pr-8 pb-3 md:p-10 text-left">
                <h1 className="font-bold text-primary mb-10 mt-5 text-xl sm:text-2xl md:text-3xl block md:hidden">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="text-primary text-3xl sm:text-4xl md:text-5xl font-bold">
                    Map your
                </h1>

                <h1 className="text-secondary text-3xl sm:text-4xl md:text-5xl font-bold">
                    reading world.
                </h1>

                <h2 className="hidden md:block text-tertiary text-base md:text-lg max-w-xs mt-4">
                    Step back into the space where your books, your thoughts, and your
                    community come together. Continue building the library that grows with you.
                </h2>
            </section>

            {/* Login form section */}
            <section
                className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg"
            >
                <h1 className="font-bold text-primary mb-6 text-xl sm:text-xl md:text-2xl hidden md:block">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary">
                    Welcome back!
                </h1>

                <form
                    noValidate
                    className="flex flex-col mt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        loginUser();
                    }}
                >
                    {/* Email input */}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className=" p-2 sm:p-3 rounded-lg mb-3 bg-input-bg text-input placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    {/* Password input */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 mb-4 rounded-lg bg-input-bg text-input placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    {/* Error messages and redirect messages */}
                    {(errors.length > 0 || redirectMessage) && (
                        <div className="bg-error-bg text-error-text p-3 rounded-lg mb-4 text-sm">
                            <ul className="list-disc list-inside space-y-1">
                                {redirectMessage && <li>{redirectMessage}</li>}
                                {errors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Submit and links to forgot password and register */}
                    <div className="flex flex-col mt-2 items-center">
                        <GenericButton
                            type="submit"
                            variant="primary"
                            className="w-full p-2 sm:p-3 text-sm sm:text-base"
                        >
                            Login
                        </GenericButton>

                        <p className="text-primary mt-2 text-xs sm:text-sm">
                            Don't have an account? <Link to="/register" className="font-bold cursor-pointer">Register</Link>
                        </p>
                        <Link to="/" className="text-primary mt-2 text-xs sm:text-sm">Forgot your password?</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}