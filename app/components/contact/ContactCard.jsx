export default function ContactCard({ title, description, email }) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
        <a 
          href={`mailto:${email}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          {email}
        </a>
      </div>
    </div>
  );
}