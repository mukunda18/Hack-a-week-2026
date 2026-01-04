import { NextResponse } from 'next/server';
import { createReport } from '@/lib/db';
import { headers } from 'next/headers';
import crypto from 'crypto';

function getIpHash(ip) {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function POST(request) {
    try {
        const data = await request.json();
        const headersList = await headers();

        // Get IP address for hashing
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
        const ipHash = getIpHash(ip);

        // Required field: officeId
        if (!data.officeId) {
            return NextResponse.json({ error: 'Office ID is required' }, { status: 400 });
        }

        const officeId = parseInt(data.officeId);
        if (isNaN(officeId) || officeId <= 0) {
            return NextResponse.json({ error: 'Invalid office ID' }, { status: 400 });
        }

        // Validate that at least one of bribeAmount or serviceDelay is provided
        const hasBribeAmount = data.bribeAmount !== undefined && data.bribeAmount !== null && data.bribeAmount !== '';
        const hasServiceDelay = data.serviceDelay !== undefined && data.serviceDelay !== null && data.serviceDelay !== '';

        if (!hasBribeAmount && !hasServiceDelay) {
            return NextResponse.json(
                { error: 'Please provide at least a bribe amount or service delay.' },
                { status: 400 }
            );
        }

        // Prepare report data mapping from camelCase (JS) to snake_case (DB expectations in createReport)
        const reportData = {
            office_id: officeId,
            ipHash: ipHash, // Used internally by createReport
            bribe_amount: hasBribeAmount ? parseFloat(data.bribeAmount) : null,
            delay: hasServiceDelay ? parseInt(data.serviceDelay) : null,
            report_date: data.reportDate || new Date().toISOString().split('T')[0],
            confidence_score: data.confidenceScore !== undefined ? parseFloat(data.confidenceScore) : 0.8,
            service_type: data.serviceType || null,
            description: data.description || null,
            visit_time: data.visitTime || null,
            interaction_method: data.interactionMethod || null,
            outcome: data.outcome || null
        };

        const select = data.select || {};

        const newReport = await createReport(reportData, select);

        return NextResponse.json(newReport, { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);

        if (error.message === 'Daily report limit reached') {
            return NextResponse.json(
                { error: 'You have reached the daily limit for reports.' },
                { status: 429 }
            );
        }

        if (error.message.includes('already exists')) {
            return NextResponse.json(
                { error: 'You have already submitted a report for this office today.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create report' },
            { status: 500 }
        );
    }
}
