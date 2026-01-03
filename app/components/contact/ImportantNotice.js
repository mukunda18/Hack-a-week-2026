export default function ImportantNotice() {
  return (
    <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <svg 
          className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <div className="text-sm">
          <div className="font-semibold text-yellow-900 mb-2">
            ⚠️ This is NOT an emergency service
          </div>
          <p className="text-yellow-800">
            This platform is for transparency reporting, not a replacement for official complaint mechanisms 
            or emergency services. For immediate safety concerns, contact local authorities.
          </p>
        </div>
      </div>
    </div>
  );
}