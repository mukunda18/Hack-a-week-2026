export default function Skeleton({ className = '', variant = 'rect' }) {
    const variants = {
        rect: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded-md h-4 w-3/4'
    };

    return (
        <div
            className={`animate-pulse bg-gray-200 ${variants[variant]} ${className}`}
            style={{
                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0))',
                backgroundSize: '200% 100%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
        />
    );
}
