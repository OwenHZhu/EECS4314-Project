/**
 * ./pages/login/LoginPage.jsx
 *
 * Login screen for collecting user credentials and submitting them through
 * useLoginForm(), which handles validation, authentication, error management,
 * and navigation on success.
 *
 * Dependencies:
 * - Link (react-router-dom): Navigation links.
 * - GenericButton: Reusable button component.
 * - GenericInput: Reusable controlled input component.
 * - ErrorList: Renders validation/auth errors.
 * - LoginHeroSection: Static marketing/branding section.
 * - useLoginForm: Provides form state + submit handler.
 *
 * Form State (from useLoginForm):
 * - email: Controlled email value
 * - password: Controlled password value
 * - errors: Array of validation/authentication errors
 * - isLoading: Indicates active login request
 * - setEmail / setPassword: Update controlled inputs
 * - handleSubmit: Runs validation + login flow
 */

import { Link } from "react-router-dom";
import GenericButton from "../../components/generic/GenericButton";
import GenericInput from "../../components/generic/GenericInput";
import ErrorList from "../../components/generic/ErrorList";
import LoginHeroSection from "./LoginHeroSection";
import { useLoginForm } from "../../hooks/auth/useLoginForm";

export default function LoginPage() {
    // Extract form state and handlers from the login form hook.
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

            {/* Left-side marketing section */}
            <LoginHeroSection />

            {/* Login form container */}
            <section
                className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg"
            >
                {/* Desktop brand header */}
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

                    {/* Validation/authentication errors */}
                    {errors.length > 0 && (
                        <ErrorList errors={errors} />
                    )}

                    {/* Submit button + navigation links */}
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
                            Don't have an account?{" "}
                            <Link to="/register" className="font-bold cursor-pointer">
                                Register
                            </Link>
                        </p>

                        <Link
                            to="/"
                            className="text-primary mt-2 text-xs sm:text-sm"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </form>
            </section>
        </div>
    );
}