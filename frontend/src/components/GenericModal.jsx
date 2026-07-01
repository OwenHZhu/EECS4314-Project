
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