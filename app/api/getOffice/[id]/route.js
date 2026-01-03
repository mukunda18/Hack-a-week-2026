import { NextResponse } from 'next/server';
import { getOfficeById } from '@/lib/db';

export const revalidate = 60;

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }
        const office = await getOfficeById(id);
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
