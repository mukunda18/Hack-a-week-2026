import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        { error: 'Report ID is required. Use /api/getReport/[id]' },
        { status: 400 }
    );
}