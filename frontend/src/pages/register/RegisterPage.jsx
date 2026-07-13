/**
 * ./pages/auth/RegisterPage.jsx
 *
 * The registration screen for the application. Handles:
 * - User input for username, email, and password
 * - Client-side validation using shared validation utilities
 * - Account creation via the `register` function from useAuth()
 * - Displaying validation and backend errors
 * - Navigating to the profile page on successful registration
 *
 * Dependencies:
 * - useNavigate (react-router-dom): Redirects the user after successful registration.
 * - validateEmail, validatePassword, validateUsername: Utility functions for input validation.
 * - useAuth: Provides register() for creating new accounts.
 * - GenericButton: Reusable button component.
 * - GenericInput: Reusable input component.
 *
 * State:
 * - username: User's chosen username
 * - email: User's email address
 * - password: User's password
 * - errors: Array of validation or registration errors
 *
 * Behaviour:
 * - Validates required fields first.
 * - Runs format/strength validation next.
 * - On validation failure: displays errors and resets fields.
 * - On backend failure: displays server message.
 * - On success: navigates to /profile and clears form state.
 */
import { Link } from "react-router-dom";
import { useRegisterForm } from "../../hooks/auth/useRegisterForm";
import GenericButton from "../../components/generic/GenericButton";
import GenericInput from "../../components/generic/GenericInput";
import RegisterHeroSection from "./RegisterHeroSection";
import ErrorList from "../../components/generic/ErrorList";

export default function RegisterPage() {
    const {
        username,
        email,
        password,
        isLoading,
        errors,
        setEmail,
        setUsername,
        setPassword,
        handleSubmit
    } = useRegisterForm();

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10 bg-background">
            <title>Register | BookAtlas</title>
            {/* Left marketing section */}
            <RegisterHeroSection />

            {/* Registration form section */}
            <section className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg">
                <h1 className="font-bold text-primary mb-6 text-xl sm:text-xl md:text-2xl hidden md:block">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary">
                    Create Account
                </h1>

                <form
                    noValidate
                    className="flex flex-col mt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    {/* Username input */}
                    <GenericInput
                        type="text"
                        placeholder="Username"
                        variant="auth"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 sm:p-3 mb-3"
                    />

                    {/* Email input */}
                    <GenericInput
                        type="email"
                        placeholder="Email"
                        variant="auth"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 sm:p-3 mb-3"
                    />

                    {/* Password input */}
                    <GenericInput
                        type="password"
                        placeholder="Password"
                        variant="auth"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 mb-3"
                    />

                    {/* Error messages */}
                    {errors.length > 0 && (
                        <ErrorList errors={errors} />
                    )}

                    {/* Submit and links to login */}
                    <div className="flex flex-col mt-2 items-center">
                        <GenericButton
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base"
                        >
                            {isLoading ? "Loading..." : "Sign up"}
                        </GenericButton>

                        <p className="text-primary mt-2 text-xs sm:text-sm">
                            Already have an account? <Link to="/login" className="font-bold cursor-pointer">Login</Link>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}