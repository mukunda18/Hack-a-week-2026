import Skeleton from '../components/common/Skeleton';

export default function ReportLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-2/3 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>

                    <div className="space-y-12">
                        {/* Step 1 Skeleton */}
                        <div>
                            <Skeleton className="h-4 w-32 mb-4" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-12 rounded-xl" />
                                ))}
                            </div>
                        </div>

                        {/* Step 2 Skeleton */}
                        <div>
                            <Skeleton className="h-4 w-40 mb-4" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
