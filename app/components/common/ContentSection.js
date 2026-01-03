export default function ContentSection({ title, children }) {
    return (
        <div className="mb-8">
            {title && <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{title}</h2>}
            <div className="text-gray-700 leading-relaxed space-y-4">
                {children}
            </div>
        </div>
    );
}
