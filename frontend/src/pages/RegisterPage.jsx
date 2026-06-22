import { useState } from "react";
import { Link } from "react-router-dom";
import { validateEmail, validatePassword, validateUsername } from "../utils/validation";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    function registerUser() {
        const emptyErrors = [];

        if (!username.trim()) {
            emptyErrors.push("Please enter your username.");
        }

        if (!email.trim()) {
            emptyErrors.push("Please enter your email.");
        }

        if (!password.trim()) {
            emptyErrors.push("Please enter your password.");
        }

        if (emptyErrors.length > 0) {
            setErrors(emptyErrors);
            setUsername("");
            setEmail("");
            setPassword("");
            return;
        }

        let validationErrors = [];
        const usernameErrors = validateUsername(username);
        const passwordErrors = validatePassword(password);

        if (!validateEmail(email)) {
            validationErrors.push("Invalid email.");
        }

        validationErrors = [...validationErrors, ...usernameErrors];
        validationErrors = [...validationErrors, ...passwordErrors];

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setUsername("");
            setEmail("");
            setPassword("");
            return;
        }

        console.log("Created user account");

        setUsername("");
        setEmail("");
        setPassword("");
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10 bg-background">
            <section className="pt-8 pl-8 pr-8 pb-3 md:p-10 text-left">
                <h1 className="font-bold text-primary mb-10 mt-5 text-xl sm:text-2xl md:text-3xl block md:hidden">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="text-primary text-3xl sm:text-4xl md:text-5xl font-bold">
                    Join the
                </h1>

                <h1 className="text-secondary text-3xl sm:text-4xl md:text-5xl font-bold">
                    reading world.
                </h1>

                <h2 className="hidden md:block text-tertiary text-base md:text-lg max-w-xs mt-4">
                    Start your reading journey in a space built for your books, your thoughts,
                    and your community. Create your library, share ideas, and discover stories
                    that grow with you.
                </h2>
            </section>

            <section className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg">
                <h1 className="font-bold text-primary mb-6 text-xl sm:text-xl md:text-2xl hidden md:block">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary">
                    Create Account
                </h1>

                {errors.length > 0 && (
                    <div className="bg-error-bg text-error-text p-3 rounded-lg mb-4 mt-4 text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form
                    noValidate
                    className="flex flex-col mt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        registerUser();
                    }}
                >
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg mb-3 bg-input-bg text-tertiary placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg mb-3 bg-input-bg text-tertiary placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg bg-input-bg text-tertiary placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <div className="flex flex-col mt-8 items-center">
                        <button
                            type="submit"
                            className="w-full rounded-full bg-login-button text-primary hover:bg-login-hover transition-colors p-2 sm:p-3 text-sm sm:text-base"
                        >
                            Sign up
                        </button>

                        <p className="text-primary mt-2 text-xs sm:text-sm">
                            Already have an account? <Link to="/login" className="font-bold cursor-pointer">Login</Link>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}