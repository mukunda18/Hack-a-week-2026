export default function OfficeConfirmation({ officeName }) {
    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">🏢</span>
            <div>
                <p className="text-sm text-blue-800 font-medium">Reporting for:</p>
                <p className="text-lg font-bold text-blue-900">{officeName}</p>
            </div>
        </div>
    );
}
