export default function ReportsTable({ reports }) {
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                <span className="text-sm text-gray-500">Showing last {reports.length} reports</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Bribe Amount</th>
                            <th className="px-6 py-4">Delay</th>
                            <th className="px-6 py-4">Confidence</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(report.report_date)}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.bribe_amount ? (
                                            <span className="font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">
                                                {formatMoney(report.bribe_amount)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">None reported</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.delay ? (
                                            <span className="font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                {report.delay} Days
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">None reported</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${report.confidence_score > 0.7 ? 'bg-green-500' :
                                                            report.confidence_score > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(report.confidence_score || 0) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {Math.round((report.confidence_score || 0) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic bg-gray-50">
                                    No reports have been submitted for this office yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
