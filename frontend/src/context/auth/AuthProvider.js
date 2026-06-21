import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useLocalStorage("token", null);

    const isAuthenticated = !!token;

    const login = useCallback(async (email, password) => {
        const res = await axios.post("BACKEND_URL/auth/login", { email, password });

        setToken(res.data.token);
        setUser(res.data.data);
    }, [setToken]);

    const register = useCallback(async (username, email, password) => {
        const res = await axios.post("BACKEND_URL/auth/register", { username, email, password });

        setToken(res.data.token);
        setUser(res.data.data);
    }, [setToken]);

    const logout = useCallback(async () => {
        try {
            await axios.post("BACKEND_URL/auth/logout", { token });
        } catch (err) {

        }

        setToken(null);
        setUser(null);
    }, [token, setToken]);

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
                const res = await axios.get("BACKEND_URL/auth/me");
                setUser(res.data.data);
            } catch (err) {
                setToken(null);
                setUser(null);
            }
        }

        restoreSession();
    }, [token, setToken]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
