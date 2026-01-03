export default function OfficeTypeFilter({ 
  selectedType, 
  officeTypes, 
  loadingTypes, 
  onTypeChange 
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Office Type
      </label>
      <select
        value={selectedType}
        onChange={onTypeChange}
        disabled={loadingTypes}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">All Office Types</option>
        {officeTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
}