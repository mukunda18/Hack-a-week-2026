import { NextResponse } from 'next/server';
import { getReportById } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const report = await getReportById(id);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}