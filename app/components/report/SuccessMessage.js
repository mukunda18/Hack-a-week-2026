export default function SuccessMessage({ onReset }) {
    return (
        <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                ✅
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Report Submitted!</h2>
            <p className="text-green-700 mb-8 max-w-md mx-auto">
                Thank you for your contribution. Your anonymous report has been added to the database and will help visualize corruption hotspots.
            </p>

            <button
                onClick={onReset}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Submit Another Report
            </button>
        </div>
    );
}
