export default function EmptyState({ onClearFilters }) {
    return (
        <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No offices found matching your criteria.</p>
            <button
                onClick={onClearFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Clear Filters
            </button>
        </div>
    );
}
