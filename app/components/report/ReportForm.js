export default function ReportForm({
    bribeAmount,
    onBribeAmountChange,
    serviceDelay,
    onServiceDelayChange,
    serviceType,
    onServiceTypeChange,
    description,
    onDescriptionChange,
    visitTime,
    onVisitTimeChange,
    interactionMethod,
    onInteractionMethodChange,
    outcome,
    onOutcomeChange,
    onSubmit,
    submitting,
    errorMsg
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bribe Amount (NPR)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">Rs.</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={bribeAmount}
                            onChange={onBribeAmountChange}
                            className="block w-full rounded-xl border-gray-300 pl-10 focus:border-red-500 focus:ring-red-500 py-3"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Leave empty if no bribe was asked.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Delay (Days)
                    </label>
                    <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={serviceDelay}
                        onChange={onServiceDelayChange}
                        className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                    />
                    <p className="mt-1 text-xs text-gray-500">Excessive days waited beyond standard time.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Citizenship, Land Transfer"
                        value={serviceType}
                        onChange={onServiceTypeChange}
                        className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approximate Visit Time
                    </label>
                    <input
                        type="time"
                        value={visitTime}
                        onChange={onVisitTimeChange}
                        className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interaction Method
                    </label>
                    <select
                        value={interactionMethod}
                        onChange={onInteractionMethodChange}
                        className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                    >
                        <option value="">Select Method</option>
                        <option value="direct">Direct with Officer</option>
                        <option value="agent">Through Agent (Dalal)</option>
                        <option value="phone">Over Phone</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Outcome
                    </label>
                    <select
                        value={outcome}
                        onChange={onOutcomeChange}
                        className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                    >
                        <option value="">Select Outcome</option>
                        <option value="success">Service Received</option>
                        <option value="failed">Service Refused</option>
                        <option value="pending">Still Waiting</option>
                        <option value="abandoned">I gave up</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description of Interaction
                </label>
                <textarea
                    rows="3"
                    placeholder="Briefly describe what happened (anonymously)..."
                    value={description}
                    onChange={onDescriptionChange}
                    className="block w-full rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500 py-3 px-4"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Do not include personal names or identifiable info.</p>
            </div>

            {errorMsg && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{errorMsg}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className={`
          w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white uppercase tracking-wider
          ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}
          transition-colors duration-200
        `}
            >
                {submitting ? 'Submitting Report...' : 'Submit Anonymous Report'}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
                Your report is encrypted and 100% anonymous. We do not store IP addresses or personal data.
            </p>
        </form>
    );
}
