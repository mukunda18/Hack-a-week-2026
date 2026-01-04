import { NextResponse } from 'next/server';
import { getOfficesSeverityMap } from '@/lib/db';

export const revalidate = 60;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            office_type_id: searchParams.get('office_type_id'),
            province: searchParams.get('province'),
            district: searchParams.get('district'),
            municipality: searchParams.get('municipality'),
            service_type: searchParams.get('service_type'),
            interaction_method: searchParams.get('interaction_method'),
            outcome: searchParams.get('outcome')
        };

        // Clean up empty filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
                delete filters[key];
            }
        });

        const offices = await getOfficesSeverityMap(filters);
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error fetching map data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch map data' },
            { status: 500 }
        );
    }
}
