import Link from 'next/link';

export default function OfficeHeader({ office, stats, reportLink }) {
    return (
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-red-900/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                                {office.office_type_name}
                            </span>
                            <span className="text-red-100 text-sm">
                                ID: {office.id}
                            </span>
                            {stats.last_reported && (
                                <span className="text-red-100 text-sm flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    Active
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{office.name}</h1>
                        <p className="text-red-100 flex items-center gap-2 text-lg">
                            📍 {office.municipality}, {office.district}, {office.province}
                        </p>
                    </div>

                    <Link
                        href={reportLink}
                        className="bg-white text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
                    >
                        🚩 Report this Office
                    </Link>
                </div>
            </div>
        </div>
    );
}
