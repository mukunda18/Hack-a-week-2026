export default function OfficialResources() {
  const resources = [
    {
      title: "Commission for the Investigation of Abuse of Authority (CIAA)",
      description: "Nepal's constitutional anti-corruption body",
      phone: "+977-1-4240859",
      website: "www.ciaa.gov.np",
      websiteUrl: "https://www.ciaa.gov.np"
    },
    {
      title: "National Vigilance Center",
      description: "Government transparency and accountability office",
      phone: "+977-1-4211444"
    },
    {
      title: "Nepal Police Cyber Bureau",
      description: "For reporting cybercrime or online threats",
      phone: "+977-1-4412588"
    }
  ];

  return (
    <div className="mb-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Official Anti-Corruption Resources
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        For formal complaints or legal action, contact these official government bodies:
      </p>
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="p-5 border border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
            <h4 className="font-semibold text-gray-900 mb-2">
              {resource.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {resource.description}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-gray-700">
                <span className="font-medium">Phone:</span> {resource.phone}
              </div>
              {resource.website && (
                <a 
                  href={resource.websiteUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {resource.website}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}