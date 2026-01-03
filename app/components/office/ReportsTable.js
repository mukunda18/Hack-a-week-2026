'use client';

import React, { useState } from 'react';

export default function ReportsTable({ reports }) {
    const [expandedRow, setExpandedRow] = useState(null);

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

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
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
                            <th className="px-6 py-4">Date & Service</th>
                            <th className="px-6 py-4">Bribe & Method</th>
                            <th className="px-6 py-4">Delay & Outcome</th>
                            <th className="px-6 py-4">Confidence</th>
                            <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <React.Fragment key={report.id}>
                                    <tr
                                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        onClick={() => toggleRow(report.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.service_type || 'General Service'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatDate(report.report_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.bribe_amount ? (
                                                <span className="font-semibold text-red-700 bg-red-50 px-2 py-1 rounded text-sm">
                                                    {formatMoney(report.bribe_amount)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">No Bribe</span>
                                            )}
                                            <div className="text-xs text-gray-500 mt-1 capitalize">
                                                By: {report.interaction_method || 'Direct'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.delay ? (
                                                <span className="font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded text-sm">
                                                    {report.delay} Days
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">No Delay</span>
                                            )}
                                            <div className={`text-xs mt-1 font-medium ${report.outcome === 'success' ? 'text-green-600' :
                                                report.outcome === 'failed' ? 'text-red-600' : 'text-gray-500'
                                                } capitalize`}>
                                                {report.outcome || 'Unknown'}
                                            </div>
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
                                            <button className="text-blue-600 text-sm font-medium hover:underline">
                                                {expandedRow === report.id ? 'Hide' : 'View'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === report.id && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="5" className="px-6 py-4">
                                                <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-100">
                                                    <div className="font-bold text-xs uppercase text-gray-400 mb-2">The Story:</div>
                                                    {report.description || 'No detailed description provided for this report.'}
                                                    {report.visit_time && (
                                                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                                                            🕒 Incident occurred around: <span className="font-medium text-gray-700">{report.visit_time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
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
