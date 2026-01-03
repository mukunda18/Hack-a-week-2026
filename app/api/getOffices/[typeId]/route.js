import { NextResponse } from 'next/server';
import { getFilteredOffices } from '@/lib/db';

export const revalidate = 300;

export async function GET(request, { params }) {
    try {
        const { typeId } = await params;
        const officeTypeId = typeId;

        const offices = await getFilteredOffices({ officeTypeId });
        return NextResponse.json(offices);
    } catch (error) {
        console.error('Error in getOffices:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
