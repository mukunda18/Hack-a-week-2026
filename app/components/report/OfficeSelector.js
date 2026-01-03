import Skeleton from '../common/Skeleton';

export default function OfficeSelector({ selectedOffice, offices, loadingOffices, onOfficeChange }) {
    if (offices.length === 0 && !loadingOffices) return null;

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                2. Select Specific Office
            </label>

            {loadingOffices ? (
                <Skeleton className="h-12 rounded-xl" />
            ) : (
                <div className="relative">
                    <select
                        value={selectedOffice}
                        onChange={onOfficeChange}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-3 pl-4 pr-10 text-base"
                    >
                        <option value="">-- Choose an Office --</option>
                        {offices.map((office) => (
                            <option key={office.id} value={office.id}>
                                {office.name} ({office.district}, {office.province})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        ▼
                    </div>
                </div>
            )}
        </div>
    );
}
