import { NextResponse } from 'next/server';
import { getOfficesSeverityMap } from '@/lib/db';

export async function GET() {
    try {
        const offices = await getOfficesSeverityMap();
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch map data' },
            { status: 500 }
        );
    }
}
