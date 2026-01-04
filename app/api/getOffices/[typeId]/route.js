import { NextResponse } from 'next/server';
import { getOffices } from '@/lib/db';

export const revalidate = 300;

export async function GET(request, { params }) {
    try {
        const { typeId } = await params;

        const { searchParams } = new URL(request.url);
        const select = {
            fields: searchParams.get('fields'),
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined,
            offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : undefined,
            orderBy: searchParams.get('orderBy') || undefined,
            orderDir: searchParams.get('orderDir') || undefined
        };

        // Clean up empty select options
        Object.keys(select).forEach(key => {
            if (select[key] === undefined || select[key] === null || select[key] === '') {
                delete select[key];
            }
        });

        const offices = await getOffices({ office_type_id: typeId }, select);
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error in getOffices by type:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
