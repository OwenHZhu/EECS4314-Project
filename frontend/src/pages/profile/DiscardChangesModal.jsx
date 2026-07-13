import { useNavigate } from "react-router-dom";
import GenericModal from "../../components/generic/GenericModal";

export default function DeleteAccountModal({ setDiscardChanges }) {
    const navigate = useNavigate();

    function handleConfirm() {
        navigate("/profile");
    }

    function handleCancel() {
        setDiscardChanges(false); 
    }

    return (
        <GenericModal
            title="Discard changes?"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );
}