export default function FeatureCard({ icon, title, description }) {
    return (
        <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}
