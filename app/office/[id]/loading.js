import Skeleton from '../../components/common/Skeleton';

export default function OfficeLoading() {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Mockup */}
            <div className="bg-slate-900 pt-16 pb-24 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="flex-1">
                            <Skeleton className="h-4 w-24 bg-slate-700 mb-4" />
                            <Skeleton className="h-12 w-96 bg-slate-700 mb-4" />
                            <div className="flex flex-wrap gap-4">
                                <Skeleton className="h-6 w-32 bg-slate-700 rounded-full" />
                                <Skeleton className="h-6 w-32 bg-slate-700 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-48 bg-slate-700 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Stats Grid Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton variant="circle" className="w-8 h-8" />
                            </div>
                            <Skeleton className="h-10 w-24 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    ))}
                </div>

                {/* Table Mockup */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <th key={i} className="px-6 py-4">
                                            <Skeleton className="h-4 w-20" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row} className="border-b border-gray-50">
                                        {[1, 2, 3, 4, 5].map((col) => (
                                            <td key={col} className="px-6 py-4">
                                                <Skeleton className="h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
