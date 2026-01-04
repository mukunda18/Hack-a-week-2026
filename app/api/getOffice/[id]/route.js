import { NextResponse } from 'next/server';
import { getOffice } from '@/lib/db';

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

        const office = await getOffice({ id }, select);

        if (!office) {
            return NextResponse.json({ error: 'Office not found' }, { status: 404 });
        }
        return NextResponse.json(office);
    } catch (error) {
        console.error('Error fetching office:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
