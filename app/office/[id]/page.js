import { getOffice, getOfficeStats, getReports } from '@/lib/db';
import Link from 'next/link';
import StatsCard from '../../components/common/StatsCard';
import ReportsTable from '../../components/office/ReportsTable';
import OfficeHeader from '../../components/office/OfficeHeader';

export const revalidate = 60;

export default async function OfficePage({ params, searchParams: searchParamsPromise }) {
    const { id } = await params;
    const sp = await searchParamsPromise;

    // Separate report filters from selection options
    const reportFilters = {
        office_id: id,
        id: sp.report_id,
        ip_hash: sp.ip_hash,
        service_type: sp.service_type,
        interaction_method: sp.interaction_method,
        outcome: sp.outcome,
        bribe_min: sp.bribe_min ? parseFloat(sp.bribe_min) : undefined,
        bribe_max: sp.bribe_max ? parseFloat(sp.bribe_max) : undefined,
        delay_min: sp.delay_min ? parseInt(sp.delay_min) : undefined,
        delay_max: sp.delay_max ? parseInt(sp.delay_max) : undefined,
        report_date: sp.report_date,
        date_from: sp.date_from,
        date_to: sp.date_to,
        confidence_min: sp.confidence_min ? parseFloat(sp.confidence_min) : undefined,
        description: sp.description,
        visit_time: sp.visit_time,
        province: sp.province,
        district: sp.district,
        municipality: sp.municipality
    };

    const reportSelect = {
        limit: sp.limit ? parseInt(sp.limit) : 50,
        offset: sp.offset ? parseInt(sp.offset) : 0,
        orderBy: sp.orderBy || 'r.created_at',
        orderDir: sp.orderDir || 'DESC',
        fields: sp.fields
    };

    // Clean up empty filters
    Object.keys(reportFilters).forEach(key => {
        if (reportFilters[key] === undefined || reportFilters[key] === null || reportFilters[key] === '') {
            delete reportFilters[key];
        }
    });

    const officeData = getOffice({ id }, { fields: sp.office_fields });
    const statsData = getOfficeStats(id);
    const reportsData = getReports(reportFilters, reportSelect);

    const [office, stats, reports] = await Promise.all([
        officeData,
        statsData,
        reportsData
    ]);

    if (!office) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Office Not Found</h1>
                    <p className="text-gray-600 mb-8">The office you are looking for does not exist.</p>
                    <Link href="/" className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const formatMoney = (amount) => {
        const num = parseFloat(amount) || 0;
        return `Rs ${num.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <OfficeHeader
                office={office}
                stats={stats}
                reportLink={`/report?officeId=${office.id}`}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Reports"
                        value={stats.total_reports}
                        subtext="All time reports"
                        icon="📝"
                        color="blue"
                        className="shadow-md"
                    />
                    <StatsCard
                        title="Avg Bribe"
                        value={formatMoney(stats.avg_bribe_amount)}
                        subtext={`Range: ${formatMoney(stats.min_bribe)} - ${formatMoney(stats.max_bribe)}`}
                        icon="💰"
                        color="red"
                        className="shadow-md"
                    />
                    <StatsCard
                        title="Avg Delay"
                        value={`${parseFloat(stats.avg_delay || 0).toFixed(1)} Days`}
                        subtext={stats.total_reports > 0 ? 'Wait time reported' : 'No delay reports'}
                        icon="⏳"
                        color="amber"
                        className="shadow-md"
                    />
                    <StatsCard
                        title="Last Activity"
                        value={formatDate(stats.last_reported)}
                        subtext="Latest submission"
                        icon="🕒"
                        color="purple"
                        className="shadow-md"
                    />
                </div>

                <ReportsTable reports={reports} />
            </div>
        </div>
    );
}
