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
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-700',
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            borderLeft: 'border-l-red-500'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            text: 'text-orange-700',
            iconBg: 'bg-orange-100',
            iconText: 'text-orange-600',
            borderLeft: 'border-l-orange-500'
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-700',
            iconBg: 'bg-amber-100',
            iconText: 'text-amber-600',
            borderLeft: 'border-l-amber-500'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-700',
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600',
            borderLeft: 'border-l-blue-500'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-100',
            text: 'text-purple-700',
            iconBg: 'bg-purple-100',
            iconText: 'text-purple-600',
            borderLeft: 'border-l-purple-500'
        }
    };

    const style = colorStyles[color] || colorStyles.blue;

    if (className.includes('shadow-md')) {
        return (
            <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${style.borderLeft} ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">{title}</h3>
                    <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center ${style.iconText}`}>
                        {icon}
                    </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
            </div>
        );
    }

    return (
        <div className={`${style.bg} p-2 rounded-lg border ${style.border} text-center ${className}`}>
            <div className={`text-[10px] ${style.iconText} uppercase font-semibold mb-1`}>{title}</div>
            <div className={`text-xl font-bold ${style.text}`}>{value}</div>
            {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
        </div>
    );
}
