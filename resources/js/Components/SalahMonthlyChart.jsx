import useTranslation from '@/hooks/useTranslation';

const STATUS_COLORS = {
    jamaat: 'bg-success',
    alone: 'bg-info',
    qada: 'bg-warning',
    missed: 'bg-error',
};

const STATUS_LABELS = {
    jamaat: 'Jamaat',
    alone: 'Alone',
    qada: 'Qada',
    missed: 'Missed',
};

const STATUSES = ['jamaat', 'alone', 'qada', 'missed'];

function MonthBar({ month }) {
    const total = STATUSES.reduce((acc, s) => acc + (month[s] ?? 0), 0);
    if (total === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-end">
                <div className="h-1 w-3 rounded bg-base-300" />
            </div>
        );
    }
    return (
        <div className="flex h-full w-full flex-col-reverse overflow-hidden rounded">
            {STATUSES.map((s) => {
                const v = month[s] ?? 0;
                if (v === 0) return null;
                const heightPct = (v / total) * 100;
                return (
                    <div
                        key={s}
                        className={`${STATUS_COLORS[s]}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${STATUS_LABELS[s]}: ${v}`}
                    />
                );
            })}
        </div>
    );
}

export default function SalahMonthlyChart({ months = [] }) {
    const { t } = useTranslation();

    if (months.length === 0) {
        return null;
    }

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <h3 className="text-sm font-semibold text-base-content/70">
                    {t('Last 6 months')}
                </h3>

                <div className="mt-2 flex h-32 items-end gap-2">
                    {months.map((m) => (
                        <div
                            key={m.month}
                            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                        >
                            <div className="h-full w-full">
                                <MonthBar month={m} />
                            </div>
                            <span className="text-[10px] text-base-content/60">
                                {m.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-base-content/60">
                    {STATUSES.map((s) => (
                        <span key={s} className="flex items-center gap-1">
                            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${STATUS_COLORS[s]}`} />
                            {t(STATUS_LABELS[s])}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
