import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function AuthProvider({ children }) {
    const [user, setUser] = useLocalStorage("user", null);
    const [token, setToken] = useLocalStorage("token", null);
    const [redirectMessage, setRedirectMessage] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const isAuthenticated = !!token;

    const login = useCallback(async (email, password) => {
        try {
            const res = await axios.post(API_BASE_URL + "auth/login", { email, password });
            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true };
        }
        catch (err) {
            const message = err.response?.data?.message || "Login failed. Please try again."

            return { success: false, message };
        }
    }, [setToken, setUser, API_BASE_URL]);

    const register = useCallback(async (username, email, password) => {
        try {
            const res = await axios.post(API_BASE_URL + "auth/register", { username, email, password });
            console.log(res.data);
            setToken(res.data.token);
            setUser(res.data.data);

            return { success: true };
        }
        catch (err) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";

            return { success: false, message };
        }

    }, [setToken, setUser, API_BASE_URL]);

    const logout = useCallback(async () => {
        try {
            const res = await axios.post(API_BASE_URL + "auth/logout", { token });
            console.log(res);
        } catch (err) {
            console.log(err);
        }

        setToken(null);
        setUser(null);
    }, [token, setToken, setUser, API_BASE_URL]);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    useEffect(() => {
        async function restoreSession() {
            if (!token) {
                setUser(null);
                return;
            }

            try {
                const res = await axios.get(API_BASE_URL + "auth/me");
                setUser(res.data.data);
            } catch (err) {
                console.log(err);
                setToken(null);
                setUser(null);
            }
        }

        restoreSession();
    }, [token, setToken, setUser, API_BASE_URL]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                redirectMessage,
                setRedirectMessage,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
