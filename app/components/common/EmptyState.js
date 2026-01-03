export default function EmptyState({ title = "No data found", description, actionLabel, onAction }) {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔍
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-500 mb-6">{description}</p>}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="text-red-600 font-medium hover:text-red-800 hover:underline"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
