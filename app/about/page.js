export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">About Ghush-Meter</h1>

      <p className="text-gray-700 mb-5">
        <strong>Ghush-Meter</strong> is a civic technology platform designed
        to visualize and analyze public perceptions of corruption in
        government offices. The platform allows citizens to anonymously
        report experiences involving unofficial payments during public
        service delivery.
      </p>

      <p className="text-gray-700 mb-5">
        Rather than focusing on individuals, Ghush-Meter highlights
        <strong> locations, service types, and recurring patterns</strong>.
        By aggregating reports, the platform helps identify offices where
        corruption is frequently perceived, encouraging transparency,
        public awareness, and data-driven governance reforms.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        How Ghush-Meter Works
      </h2>

      <p className="text-gray-700 mb-4">
        Ghush-Meter operates on a simple, privacy-focused, and anonymous
        reporting model:
      </p>

      <ol className="list-decimal list-inside text-gray-700 mb-5 space-y-2">
        <li>
          <strong>Anonymous Submission:</strong> Users submit reports
          describing the office location, type of service, and the
          approximate amount of unofficial payment requested or paid.
          No personal identity, login, or device information is stored.
        </li>
        <li>
          <strong>Location Mapping:</strong> Each report is associated
          with a geographic location. Reports are aggregated per office
          and displayed on an interactive map for easy visualization.
        </li>
        <li>
          <strong>Data Aggregation:</strong> Multiple submissions for
          the same office are combined to calculate a relative
          corruption intensity score. Individual reports are never
          shown separately.
        </li>
        <li>
          <strong>Heatmap Visualization:</strong> Offices with higher
          report frequency or higher average amounts appear more
          prominently on the map, allowing users to identify high-risk
          locations at a glance.
        </li>
        <li>
          <strong>Public Awareness:</strong> Aggregated data can be used
          by citizens, researchers, and policymakers to understand
          trends and promote accountability.
        </li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Data Ethics & Limitations
      </h2>

      <p className="text-gray-700 mb-4">
        All information on Ghush-Meter is user-reported and reflects
        public perception, not verified legal evidence. The platform does
        not name individuals or make legal accusations.
      </p>

      <p className="text-gray-700">
        Ghush-Meter is developed as an academic and social innovation
        initiative, intended to support ethical governance, transparency,
        and informed discussion through technology.
      </p>
    </div>
  );
}
