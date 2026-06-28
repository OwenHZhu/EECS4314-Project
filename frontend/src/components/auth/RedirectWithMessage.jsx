import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";

export default function RedirectWithMessage({ message }) {
    const { setRedirectMessage } = useAuth();

    useEffect(() => {
        setRedirectMessage(message);
    }, [message, setRedirectMessage]);

    return <Navigate to="/login" replace />;
}