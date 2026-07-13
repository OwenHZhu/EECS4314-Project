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
 * - GenericInput: Reusable input component.
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
import { Link } from "react-router-dom";
import GenericButton from "../../components/generic/GenericButton";
import GenericInput from "../../components/generic/GenericInput";
import ErrorList from "../../components/generic/ErrorList";
import LoginHeroSection from "./components/LoginHeroSection";
import { useLoginForm } from "../../hooks/auth/useLoginForm";

export default function LoginPage() {
    const {
        email,
        password,
        errors,
        isLoading,
        setEmail,
        setPassword,
        handleSubmit,
    } = useLoginForm();

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10">
            <title>Login | BookAtlas</title>

            {/* Left marketing section */}
            <LoginHeroSection />

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
                    className="flex flex-col mt-3"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <GenericInput
                        type="email"
                        placeholder="Email"
                        variant="auth"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 sm:p-3 mb-3"
                    />

                    <GenericInput
                        type="password"
                        placeholder="Password"
                        variant="auth"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 mb-3"
                    />

                    {/* Error messages and redirect messages */}
                    {(errors.length > 0) && (
                        <ErrorList errors={errors} />
                    )}

                    {/* Submit and links to forgot password and register */}
                    <div className="flex flex-col mt-2 items-center">
                        <GenericButton
                            type="submit"
                            variant="primary"
                            className="w-full p-2 sm:p-3 text-sm sm:text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
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