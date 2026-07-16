/**
 * ./components/generic/GenericModal.jsx
 *
 * Reusable confirmation modal with a title, optional message block,
 * and two action buttons (confirm + cancel). Visibility is controlled
 * by the parent; this component only renders UI.
 *
 * Dependencies:
 * - GenericButton: Used for confirm and cancel actions.
 *
 * Props:
 * @param {string} title        - Modal heading text.
 * @param {boolean} message     - Whether to display the static warning text block.
 * @param {string} confirmLabel - Text for the confirm button.
 * @param {string} cancelLabel  - Text for the cancel button.
 * @param {Function} onConfirm  - Fired when the confirm button is clicked.
 * @param {Function} onCancel   - Fired when the cancel button is clicked.
 *
 */

import GenericButton from "./GenericButton";

export default function GenericModal({
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="flex flex-col items-center bg-[#1A2523] border-[#00FFCC] border p-4 md:p-6 max-w-fit font-medium rounded-lg">
                <h1 className="text-sm md:text-base font-medium text-[#CFE8ED] mb-1">
                    {title}
                </h1>

                {message && (
                    <div className="flex flex-col items-center mb-3">
                        <p className="text-xs text-[#839497]">This action cannot be undone.</p>
                        <p className="text-xs text-[#839497]">All personal data will be permanently deleted.</p>
                    </div>
                )}

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
                        className="text-xs py-2 md:py-3 px-6 md:px-8"
                    >
                        {cancelLabel}
                    </GenericButton>
                </div>
            </div>
        </div>
    );
}