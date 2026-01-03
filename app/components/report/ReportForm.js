export default function ReportForm({ 
  bribeAmount, 
  onBribeAmountChange,
  serviceDelay,
  onServiceDelayChange,
  onSubmit, 
  submitting, 
  errorMsg 
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Report Details
      </h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bribe Amount asked (NPR)
        </label>
        <input
          type="number"
          value={bribeAmount}
          onChange={onBribeAmountChange}
          placeholder="e.g. 5000"
          min="0"
          step="0.01"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">Optional - Leave blank if no bribe was asked</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Delay (days)
        </label>
        <input
          type="number"
          value={serviceDelay}
          onChange={onServiceDelayChange}
          placeholder="e.g. 5"
          min="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">Optional - Number of days the service was delayed</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || (!bribeAmount && !serviceDelay)}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting Report...' : 'Submit Report'}
      </button>
    </form>
  );
}