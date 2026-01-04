export default function StatsCard({
    title,
    value,
    subtext,
    icon,
    color = 'blue',
    className = ''
}) {
    const colorStyles = {
        red: {
            bg: 'bg-white',
            accent: 'bg-red-500',
            text: 'text-red-600',
            light: 'bg-red-50',
            border: 'border-red-100'
        },
        orange: {
            bg: 'bg-white',
            accent: 'bg-orange-500',
            text: 'text-orange-600',
            light: 'bg-orange-50',
            border: 'border-orange-100'
        },
        amber: {
            bg: 'bg-white',
            accent: 'bg-amber-500',
            text: 'text-amber-600',
            light: 'bg-amber-50',
            border: 'border-amber-100'
        },
        blue: {
            bg: 'bg-white',
            accent: 'bg-blue-500',
            text: 'text-blue-600',
            light: 'bg-blue-50',
            border: 'border-blue-100'
        },
        purple: {
            bg: 'bg-white',
            accent: 'bg-purple-500',
            text: 'text-purple-600',
            light: 'bg-purple-50',
            border: 'border-purple-100'
        }
    };

    const style = colorStyles[color] || colorStyles.blue;

    // Small inline version (for the map sidebar)
    if (!className.includes('shadow-md')) {
        return (
            <div className={`p-4 rounded-xl border ${style.border} ${style.light} transition-all`}>
                <div className={`text-[10px] ${style.text} uppercase font-bold tracking-wider mb-1 opacity-70`}>{title}</div>
                <div className={`text-xl font-extrabold text-gray-900`}>{value}</div>
                {subtext && <div className="text-[10px] text-gray-500 mt-1">{subtext}</div>}
            </div>
        );
    }

    // Large card version (for office page / dashboards)
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden ${className}`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${style.accent}`}></div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{title}</h3>
                <div className={`w-10 h-10 rounded-xl ${style.light} flex items-center justify-center text-xl`}>
                    {icon || '📊'}
                </div>
            </div>
            <div className="relative">
                <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
                {subtext && <p className="text-xs font-semibold text-gray-400 mt-2">{subtext}</p>}
            </div>
        </div>
    );
}
