import { NextResponse } from 'next/server';
import { getOfficeTypes } from '@/lib/db';

export const revalidate = 3600;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            id: searchParams.get('id'),
            name: searchParams.get('name')
        };
        const select = {
            fields: searchParams.get('fields')
        };

        const types = await getOfficeTypes(filters, select);
        return NextResponse.json(types);
    } catch (error) {
        console.error('Error fetching office types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch office types' },
            { status: 500 }
        );
    }
}
