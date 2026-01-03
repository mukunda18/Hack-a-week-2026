'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function ReportDetailPage() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`/api/reports/${id}`);
                setReport(response.data);
            } catch (error) {
                console.error('Error fetching report:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!report) return <div>Report not found</div>;

    return (
        <div>
            <h1>Report Details</h1>
            <p>Report ID: {id}</p>
            <p>Report Data: {JSON.stringify(report)}</p>
        </div>
    );
}