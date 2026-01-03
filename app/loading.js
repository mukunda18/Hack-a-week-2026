import Skeleton from './components/common/Skeleton';

export default function Loading() {
    return (
        <main className="flex-1 relative bg-gray-50 flex flex-col">
            {/* Hero Section Mockup */}
            <div className="w-full h-[600px] relative z-0 bg-gray-100">
                <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur rounded-xl shadow-xl p-6 max-w-md border border-gray-100 hidden md:block w-full">
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-6" />

                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <Skeleton className="h-2 w-3/4 mx-auto mb-2" />
                                <Skeleton className="h-6 w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map area pulse */}
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-100 animate-ping opacity-20"></div>
                </div>
            </div>

            {/* Why Report Section Mockup */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
                        <Skeleton className="h-4 w-full mx-auto mb-2" />
                        <Skeleton className="h-4 w-5/6 mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6">
                                <Skeleton className="h-12 w-12 rounded-xl mb-6" />
                                <Skeleton className="h-6 w-1/2 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
