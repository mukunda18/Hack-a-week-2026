import { NextResponse } from 'next/server';
import { getOffices } from '@/lib/db';

export const revalidate = 300;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = {
            id: searchParams.get('id'),
            office_type_id: searchParams.get('office_type_id'),
            province: searchParams.get('province'),
            district: searchParams.get('district'),
            municipality: searchParams.get('municipality'),
            name: searchParams.get('name'),
            latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')) : undefined,
            longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')) : undefined,
            radius: searchParams.get('radius') ? parseFloat(searchParams.get('radius')) : undefined
        };

        const select = {
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined,
            offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : undefined,
            orderBy: searchParams.get('orderBy') || 'o.name',
            orderDir: searchParams.get('orderDir') || 'ASC',
            fields: searchParams.get('fields')
        };

        // Cleanup empty filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
                delete filters[key];
            }
        });

        // Cleanup empty select options
        Object.keys(select).forEach(key => {
            if (select[key] === undefined || select[key] === null || select[key] === '') {
                delete select[key];
            }
        });

        const offices = await getOffices(filters, select);
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error in general getOffices API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
