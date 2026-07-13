import { useNavigate } from "react-router-dom";
import GenericButton from "../generic/GenericButton";

export default function AuthRequiredModal() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h2 className="text-xl font-bold mb-3 text-primary">
                    Login Required
                </h2>

                <p className="text-tertiary mb-6 text-sm">
                    You must be logged in to access this page.
                </p>

                <div className="flex gap-3">
                    <GenericButton
                        onClick={() => navigate("/login")}
                        variant="primary"
                    >
                        Login
                    </GenericButton>

                    <GenericButton
                        onClick={() => navigate("/register")}
                        variant="secondary"
                    >
                        Sign Up
                    </GenericButton>
                </div>
            </div>
        </div>
    );
}