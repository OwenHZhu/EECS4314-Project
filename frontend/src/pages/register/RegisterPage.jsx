/**
 * ./pages/register/RegisterPage.jsx
 *
 * Registration screen for creating a new user account. Uses useRegisterForm()
 * to manage controlled inputs, validation, submission, and error handling.
 *
 * Dependencies:
 * - Link (react-router-dom): Navigation to login.
 * - GenericButton: Reusable button component.
 * - GenericInput: Reusable controlled input component.
 * - ErrorList: Renders validation/auth errors.
 * - RegisterHeroSection: Static marketing/branding section.
 * - useRegisterForm: Provides registration form state + submit handler.
 *
 * Form State (from useRegisterForm):
 * - username: Controlled username value
 * - email: Controlled email value
 * - password: Controlled password value
 * - errors: Array of validation/authentication errors
 * - isLoading: Indicates active registration request
 * - setUsername / setEmail / setPassword: Update controlled inputs
 * - handleSubmit: Runs validation + registration flow
 */

import { Link } from "react-router-dom";
import { useRegisterForm } from "../../hooks/auth/useRegisterForm";
import GenericButton from "../../components/generic/GenericButton";
import GenericInput from "../../components/generic/GenericInput";
import RegisterHeroSection from "./RegisterHeroSection";
import ErrorList from "../../components/generic/ErrorList";

export default function RegisterPage() {
    // Extract form state and handlers from the registration form hook.
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

            {/* Left-side marketing section */}
            <RegisterHeroSection />

            {/* Registration form container */}
            <section className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg">
                {/* Desktop brand header */}
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

                    {/* Validation/authentication errors */}
                    {errors.length > 0 && (
                        <ErrorList errors={errors} />
                    )}

                    {/* Submit button + navigation link */}
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
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold cursor-pointer">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}