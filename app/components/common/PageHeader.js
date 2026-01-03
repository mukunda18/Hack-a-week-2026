export default function PageHeader({ title, children }) {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>
            {children}
        </div>
    );
}
