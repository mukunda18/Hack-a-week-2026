export default function OfficeSelector({ 
  selectedOffice, 
  offices, 
  loadingOffices, 
  onOfficeChange 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Specific Office
      </label>
      <select
        value={selectedOffice}
        onChange={onOfficeChange}
        disabled={loadingOffices}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">
          {loadingOffices ? 'Updating offices...' : 'Choose an office...'}
        </option>
        {offices.map(office => (
          <option key={office.id} value={office.id}>
            {office.name} {office.district ? `— ${office.district}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}