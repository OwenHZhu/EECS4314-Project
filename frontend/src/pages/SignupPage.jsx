import { useState } from "react";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function signupUser() {
        console.log("Created user account");

        setUsername("");
        setEmail("");
        setPassword("");
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-center min-h-screen pb-10 bg-background">
            <section className="p-8 md:p-10 text-left">
                <h1 className="font-bold text-primary-text mb-10 mt-5 text-xl sm:text-2xl md:text-3xl block md:hidden">
                    Book<span className="text-secondary-text">Atlas</span>
                </h1>

                <h1 className="text-primary-text text-3xl sm:text-4xl md:text-5xl font-bold">
                    Join the
                </h1>

                <h1 className="text-secondary-text text-3xl sm:text-4xl md:text-5xl font-bold">
                    reading world.
                </h1>

                <h2 className="hidden md:block text-tertiary-text text-base md:text-lg max-w-xs mt-4">
                    Start your reading journey in a space built for your books, your thoughts,
                    and your community. Create your library, share ideas, and discover stories
                    that grow with you.
                </h2>
            </section>

            <section className="flex flex-col justify-start w-full max-w-md p-8 md:p-10 md:border-l-2 md:border-[#1F1816]">
                <h1 className="font-bold text-primary-text mb-6 text-xl sm:text-xl md:text-2xl hidden md:block">
                    Book<span className="text-secondary-text">Atlas</span>
                </h1>

                <h1 className="font-bold mb-2 text-sm sm:text-base md:text-xl text-tertiary-text">
                    Create Account
                </h1>

                <form
                    className="flex flex-col mt-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        signupUser();
                    }}
                >
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg mb-3 bg-[#2B1512] text-tertiary-text placeholder-[#5A4B4B] focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg mb-3 bg-[#2B1512] text-tertiary-text placeholder-[#5A4B4B] focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 sm:p-3 rounded-lg bg-[#2B1512] text-tertiary-text placeholder-[#5A4B4B] focus:ring-2 focus:ring-input-border focus:outline-none text-sm sm:text-base"
                    />

                    <div className="flex flex-col mt-8 items-center">
                        <button
                            type="submit"
                            className="w-full rounded-full bg-login-button text-primary-text hover:bg-login-hover p-2 sm:p-3 text-sm sm:text-base"
                        >
                            Sign up
                        </button>

                        <p className="text-primary-text mt-2 text-xs sm:text-sm">
                            Already have an account? <a className="font-bold cursor-pointer">Login</a>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}