export default function SuccessMessage({ onReset }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
        <p className="font-medium">
          Report submitted successfully! Thank you for your contribution.
        </p>
      </div>
      <button
        onClick={onReset}
        className="w-full bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Submit another report
      </button>
    </div>
  );
}