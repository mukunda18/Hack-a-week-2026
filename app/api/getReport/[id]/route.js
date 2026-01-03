import { NextResponse } from 'next/server';
import { getReportById } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const report = await getReportById(id);
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }
        return NextResponse.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
