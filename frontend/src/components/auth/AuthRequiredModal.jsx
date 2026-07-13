import { useNavigate } from "react-router-dom";
import GenericButton from "../generic/GenericButton";

export default function AuthRequiredModal() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-[#1A2523] border-2 border-[#00FFCC] p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h2 className="text-lg md:text-xl text-[#CFE8ED] font-bold mb-3">
                    Login Required
                </h2>

                <p className="text-[#839497] mb-6 text-sm">
                    You must be logged in to access this page.
                </p>

                <div className="flex gap-3">
                    <GenericButton
                        onClick={() => navigate("/login")}
                        variant="primary"
                        className="text-xs py-2 md:py-3 px-6 md:px-8"
                    >
                        Login
                    </GenericButton>

                    <GenericButton
                        onClick={() => navigate("/register")}
                        variant="secondary"
                        className="text-xs py-2 md:py-3 px-6 md:px-8"
                    >
                        Sign Up
                    </GenericButton>
                </div>
            </div>
        </div>
    );
}