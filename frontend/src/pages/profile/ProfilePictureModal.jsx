/**
 * ./components/auth/EditPictureModal.jsx
 *
 * A modal that allows the user to update their profile picture.
 * Provides three actions:
 *  - Upload a new photo (not yet implemented)
 *  - Remove the current photo (not yet implemented)
 *  - Cancel and close the modal
 *
 * The modal's visibility is controlled externally through the
 * `setEditPicture` state setter passed in as a prop.
 * 
 * Dependencies: 
 * - GenericButton: Reusable button component used for the modal's actions.
 *
 * Props:
 * @param {Function} setEditPicture - Setter used to toggle the modal's visibility.
 */
import Icon from "../../components/generic/Icon";

export default function ProfilePictureModal({ setEditPicture }) {
    function close() {
        setEditPicture(false);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col space-y-2 font-bold items-center bg-[#1A2523] border-[#3A8173] rounded-md border-2 p-8 max-w-fit">
                <h1 className="text-sm text-[#CFE8ED]">Change Profile Photo</h1>

                {/* TODO: Upload button needs to connect to a file upload handler */}
                <div
                    className="cursor-pointer flex flex-row space-x-1 items-center"
                >
                    <Icon
                        className="text-[#238874]"
                    >
                        upload
                    </Icon>
                    <p className="text-[#839497] text-xs">Upload</p>
                </div>

                {/* TODO: Connect to backend */}
                <div
                    className="cursor-pointer flex flex-row space-x-1 items-center"
                >
                    <Icon
                        className="text-[#238874]"
                    >
                        scan_delete
                    </Icon>
                    <p className="text-[#839497] text-xs">Remove</p>
                </div>

                {/* TODO: Close modal */}
                <div
                    onClick={close}
                    className="cursor-pointer flex flex-row space-x-1 items-center"
                >
                    <Icon
                        className="text-[#238874]"
                    >
                        close
                    </Icon>
                    <p className="text-[#839497] text-xs">Close</p>
                </div>
            </div>
        </div>
    );
}