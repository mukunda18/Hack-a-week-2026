import { NextResponse } from 'next/server';
import { getReport } from '@/lib/db';

export const revalidate = 60;

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const select = {
            fields: searchParams.get('fields')
        };

        const report = await getReport({ id }, select);

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
