export default function StreakHeatmap({ dates = [] }) {
    const today = new Date();
    const cells = [];

    const doneSet = new Set(dates);

    for (let i = 89; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const done = doneSet.has(key);
        cells.push({ key, done });
    }

    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">90-day activity</p>
            <div className="flex flex-wrap gap-0.5">
                {cells.map(({ key, done }) => (
                    <div
                        key={key}
                        title={key}
                        className={`h-3 w-3 rounded-sm ${
                            done ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gray-200" /> missed
                </span>
                <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> done
                </span>
            </div>
        </div>
    );
}
