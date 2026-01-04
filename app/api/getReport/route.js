import { NextResponse } from 'next/server';
import { getReports } from '@/lib/db';

export const revalidate = 60;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = {
            id: searchParams.get('id'),
            office_id: searchParams.get('office_id'),
            ip_hash_id: searchParams.get('ip_hash_id'),
            ip_hash: searchParams.get('ip_hash'),
            service_type: searchParams.get('service_type'),
            interaction_method: searchParams.get('interaction_method'),
            outcome: searchParams.get('outcome'),
            bribe_min: searchParams.get('bribe_min') ? parseFloat(searchParams.get('bribe_min')) : undefined,
            bribe_max: searchParams.get('bribe_max') ? parseFloat(searchParams.get('bribe_max')) : undefined,
            delay_min: searchParams.get('delay_min') ? parseInt(searchParams.get('delay_min')) : undefined,
            delay_max: searchParams.get('delay_max') ? parseInt(searchParams.get('delay_max')) : undefined,
            report_date: searchParams.get('report_date'),
            date_from: searchParams.get('date_from'),
            date_to: searchParams.get('date_to'),
            confidence_min: searchParams.get('confidence_min') ? parseFloat(searchParams.get('confidence_min')) : undefined,
            description: searchParams.get('description'),
            visit_time: searchParams.get('visit_time'),
            province: searchParams.get('province'),
            district: searchParams.get('district'),
            municipality: searchParams.get('municipality')
        };

        const select = {
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 50,
            offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0,
            orderBy: searchParams.get('orderBy') || 'r.created_at',
            orderDir: searchParams.get('orderDir') || 'DESC',
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

        const reports = await getReports(filters, select);

        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error in reports API:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
