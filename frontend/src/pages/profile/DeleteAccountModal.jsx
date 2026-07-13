import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import GenericModal from "../../components/generic/GenericModal";

export default function DeleteAccountModal({ setShowDelete }) {
    const navigate = useNavigate(); 
    const { deleteAccount } = useAuth();

    function handleConfirm() {
        deleteAccount();
        navigate("/register");
    }

    function handleCancel() {
        setShowDelete(false);
    }

    return (
        <GenericModal
            title="Delete Account?"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}