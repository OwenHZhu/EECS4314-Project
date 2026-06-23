import { useState } from "react";
import { Link } from "react-router-dom";
import { validateEmail } from "../utils/validation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);

    function loginUser() {
        const newErrors = [];

        if (!email.trim()) {
            newErrors.push("Please enter your email.");
        }
        if (!password.trim()) {
            newErrors.push("Please enter your password.");
        }

        if (email && !validateEmail(email)) {
            newErrors.push("Please enter a valid email address.");
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            setEmail("");
            setPassword("");
            return;
        }

        console.log("Logged in the user");
        setEmail("");
        setPassword("");
        setErrors([]);
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10">

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

            <section
                className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-input-bg"
            >
                <h1 className="font-bold text-primary mb-6 text-xl sm:text-xl md:text-2xl hidden md:block">
                    Book<span className="text-secondary">Atlas</span>
                </h1>

                <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary">
                    Welcome back!
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
                        loginUser();
                    }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className=" p-2 sm:p-3 rounded-lg mb-3 bg-input-bg text-input placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg bg-input-bg text-input placeholder-input-placeholder focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <div className="flex flex-col mt-8 items-center">
                        <button
                            type="submit"
                            className="w-full rounded-full transition-colors bg-login-button text-primary hover:bg-login-hover p-2 sm:p-3 text-sm sm:text-base"
                        >
                            Login
                        </button>

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