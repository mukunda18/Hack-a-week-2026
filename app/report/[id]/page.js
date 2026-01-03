'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Skeleton from '@/app/components/common/Skeleton';

export default function ReportDetailPage() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`/api/getReport/${id}`);
                setReport(response.data);
            } catch (error) {
                console.error('Error fetching report:', error);
                setError(error.response?.data?.error || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <Skeleton className="h-10 w-64 mb-6" />
                        <div className="space-y-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="border-b border-gray-200 pb-4">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-6 w-48" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        <h2 className="font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
                    <p className="text-gray-600">The report you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Report Details</h1>

                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Report ID</h2>
                            <p className="text-lg text-gray-900 font-mono">{report.id}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Office</h2>
                            <p className="text-lg text-gray-900">{report.office_name}</p>
                            <p className="text-sm text-gray-600">{report.office_type_name}</p>
                        </div>

                        {report.bribe_amount !== null && (
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-sm font-medium text-gray-500 mb-1">Bribe Amount</h2>
                                <p className="text-lg text-gray-900">NPR {parseFloat(report.bribe_amount).toLocaleString()}</p>
                            </div>
                        )}

                        {report.delay !== null && (
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-sm font-medium text-gray-500 mb-1">Service Delay</h2>
                                <p className="text-lg text-gray-900">{report.delay} day{report.delay !== 1 ? 's' : ''}</p>
                            </div>
                        )}

                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Report Date</h2>
                            <p className="text-lg text-gray-900">{new Date(report.report_date).toLocaleDateString()}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Confidence Score</h2>
                            <p className="text-lg text-gray-900">{(report.confidence_score * 100).toFixed(1)}%</p>
                        </div>

                        <div>
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Created At</h2>
                            <p className="text-lg text-gray-900">{new Date(report.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}