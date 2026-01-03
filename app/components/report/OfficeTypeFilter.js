import Skeleton from '../common/Skeleton';

export default function OfficeTypeFilter({ selectedType, officeTypes, loadingTypes, onTypeChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                1. Select Office Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {loadingTypes
                    ? Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                    ))
                    : officeTypes.map((type) => (
                        <label
                            key={type.id}
                            className={`
                  relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedType == type.id
                                    ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                }
                `}
                        >
                            <input
                                type="radio"
                                name="officeType"
                                value={type.id}
                                checked={selectedType == type.id}
                                onChange={onTypeChange}
                                className="sr-only"
                            />
                            <span className="text-sm text-center">{type.name}</span>
                        </label>
                    ))}
            </div>
        </div>
    );
}
