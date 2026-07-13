/**
 * ./components/generic/GenericModal.jsx
 *
 * A reusable modal component that displays a title and two action buttons:
 * a confirm button and a cancel button. This component is intended for
 * general-purpose confirmation flows (e.g., deleting an item, confirming
 * a change, etc.).
 *
 * Dependencies:
 * - GenericButton: Reusable button component used for the confirm and cancel actions.
 * - TailwindCSS utility classes for layout, spacing, and color styling.
 *
 * Props:
 * @param {string} title - The heading text displayed at the top of the modal.
 * @param {string} confirmLabel - The label shown on the confirm button.
 * @param {string} cancelLabel - The label shown on the cancel button.
 * @param {Function} onConfirm - Callback fired when the confirm button is clicked.
 * @param {Function} onCancel - Callback fired when the cancel button is clicked.
 *
 * Usage Notes:
 * - This modal does not manage its own visibility; parent components must
 *   conditionally render it.
 * - The modal does not include backdrop or focus trapping; these should be
 *   implemented at a higher level if needed.
 */
import GenericButton from "./GenericButton";

export default function GenericModal({
    title,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center bg-[#1A2523] border-[#00FFCC] border p-4 md:p-6 max-w-fit font-medium rounded-lg">
                <h1 className="text-sm md:text-base font-medium text-[#CFE8ED] mb-4">
                    {title}
                </h1>

                <div className="flex flex-row gap-3 md:gap-4">
                    <GenericButton
                        onClick={onConfirm}
                        variant="secondary"
                        className="text-xs py-2 md:py-3 px-6 md:px-8"
                    >
                        {confirmLabel}
                    </GenericButton>

                    <GenericButton
                        onClick={onCancel}
                        variant="ghost"
                        className=" text-xs py-2 md:py-3 px-6 md:px-8"
                    >
                        {cancelLabel}
                    </GenericButton>
                </div>
            </div>
        </div>
    );
}