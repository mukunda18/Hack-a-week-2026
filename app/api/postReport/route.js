import { NextResponse } from 'next/server';
import { createReport } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();
        const { officeId, bribeAmount } = body;

        if (!officeId || !bribeAmount) {
            return NextResponse.json(
                { error: 'Office ID and Bribe Amount are required' },
                { status: 400 }
            );
        }

        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const ipHash = crypto.createHash('md5').update(ip).digest('hex');

        const reportDate = new Date().toISOString().split('T')[0];

        let amountRange = 'Low';
        const amount = parseFloat(bribeAmount);
        if (amount > 100000) amountRange = 'High';
        else if (amount > 10000) amountRange = 'Medium';

        const reportData = {
            office_id: officeId,
            ipHash: ipHash,
            bribe_amount: amount,
            amount_range: amountRange,
            report_date: reportDate,
            confidence_score: 0.5
        };

        const report = await createReport(reportData);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}
