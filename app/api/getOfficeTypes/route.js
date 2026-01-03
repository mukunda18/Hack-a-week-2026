import { NextResponse } from 'next/server';
import { getOfficeTypes } from '@/lib/db';

export const revalidate = 3600;

export async function GET() {
    try {
        const types = await getOfficeTypes();
        return NextResponse.json(types);
    } catch (error) {
        console.error('Error fetching office types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch office types' },
            { status: 500 }
        );
    }
}
