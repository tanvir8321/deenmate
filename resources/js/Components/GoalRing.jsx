export default function GoalRing({ current, target, label, color = 'emerald', size = 80, strokeWidth = 8 }) {
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    const center = size / 2;

    const colorMap = {
        emerald: { stroke: '#059669', bg: '#d1fae5' },
        blue: { stroke: '#2563eb', bg: '#dbeafe' },
        amber: { stroke: '#d97706', bg: '#fef3c7' },
        rose: { stroke: '#e11d48', bg: '#ffe4e6' },
        violet: { stroke: '#7c3aed', bg: '#ede9fe' },
    };

    const c = colorMap[color] ?? colorMap.emerald;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={c.bg}
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={c.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
                <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={c.stroke}
                    fontSize={size * 0.22}
                    fontWeight="bold"
                    className="rotate-90"
                >
                    {Math.round(pct)}%
                </text>
            </svg>
            <p className="mt-1 text-xs font-medium text-gray-600">{label}</p>
            <p className="text-xs text-gray-400">
                {current}/{target}
            </p>
        </div>
    );
}
