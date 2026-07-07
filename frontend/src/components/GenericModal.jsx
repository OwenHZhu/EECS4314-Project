/**
 * ./components/auth/GenericModal.jsx
 *
 * A reusable modal component that displays a title and two action buttons:
 * a confirm button and a cancel button. This component is intended for
 * general-purpose confirmation flows (e.g., deleting an item, confirming
 * a change, etc.).
 *
 * Dependencies:
 * - TailwindCSS utility classes for layout, spacing, and color styling.
 *   No external libraries are used beyond React itself.
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

export default function GenericModal({ title, confirmLabel, cancelLabel, onConfirm, onCancel }) {

    return (
        <div className="flex flex-col font-bold items-center bg-card-fill border-card-stroke rounded-md border-2 p-4 max-w-fit">
            <h1 className="text-sm md:text-lg text-primary mb-3">{title}</h1>
            <div className="flex flex-row">
                <button
                    onClick={onConfirm}
                    className="bg-secondary text-xs md:text-sm py-3 px-8 rounded-full mx-3 my-2 hover:bg-logout-hover transition-colors"
                >
                    {confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="py-3 px-8 text-xs md:text-sm rounded-full mx-3 my-2 border-cancel-stroke border-2 hover:border-tertiary transition-colors"
                >
                    {cancelLabel}
                </button>
            </div>
        </div>
    );
}