export default function OfficeConfirmation({ officeName }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Office Confirmed
        </h3>
        <p className="text-blue-800">
          You have selected{' '}
          <span className="font-semibold">{officeName}</span>.
        </p>
      </div>
    </div>
  );
}