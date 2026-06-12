import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

const INTENSITY_BG = [
    'bg-base-300',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-500',
    'bg-emerald-600 dark:bg-emerald-400',
    'bg-emerald-700 dark:bg-emerald-300',
];

function Heatmap({ cells = [] }) {
    if (cells.length === 0) {
        return null;
    }

    return (
        <div
            className="grid grid-flow-col grid-rows-7 gap-0.5"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
        >
            {cells.map(({ date, value }) => {
                const level = Math.min(5, Math.max(0, value));
                const label = `${date} \u2014 ${value} prayers on time`;
                return (
                    <div
                        key={date}
                        title={label}
                        aria-label={label}
                        className={`h-3 w-3 rounded-sm ${INTENSITY_BG[level]}`}
                    />
                );
            })}
        </div>
    );
}

function Stat({ label, value, color }) {
    return (
        <div className="rounded-md bg-base-200 p-2 text-center">
            <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-base-content/60">
                {label}
            </div>
        </div>
    );
}

export default function SalahActivityCard({
    heatmap = [],
    breakdown = { jamaat: 0, alone: 0, qada: 0, missed: 0 },
    streak = 0,
    qadaSummary = null,
}) {
    const { t } = useTranslation();

    const total = breakdown.jamaat + breakdown.alone + breakdown.qada + breakdown.missed;
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

    const cells = heatmap.length > 0
        ? heatmap.map((row, i) => ({ ...row, _idx: i }))
        : [];

    const outstanding = qadaSummary?.outstanding ?? 0;
    const qadaOwed = qadaSummary?.owed ?? 0;
    const qadaRepaid = qadaSummary?.repaid ?? 0;

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-sm font-semibold text-base-content/70">
                        {t('Salah activity')}
                    </h2>
                    <span className="badge badge-success badge-sm">
                        {streak} {t('days streak')}
                    </span>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2">
                    <Stat
                        label={t('Jamaat')}
                        value={breakdown.jamaat}
                        color="text-success"
                    />
                    <Stat
                        label={t('Alone')}
                        value={breakdown.alone}
                        color="text-info"
                    />
                    <Stat
                        label={t('Qada')}
                        value={breakdown.qada}
                        color="text-warning"
                    />
                    <Stat
                        label={t('Missed')}
                        value={breakdown.missed}
                        color="text-error"
                    />
                </div>

                <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-base-content/60">
                        {t('Last 90 days')}
                    </p>
                    <Heatmap cells={cells} />
                    <div className="flex items-center gap-1.5 text-[10px] text-base-content/50">
                        <span>{t('Less')}</span>
                        {INTENSITY_BG.map((cls, i) => (
                            <span
                                key={i}
                                className={`inline-block h-2.5 w-2.5 rounded-[2px] ${cls}`}
                            />
                        ))}
                        <span>{t('More')}</span>
                    </div>
                </div>

                <div className="mt-3 border-t border-base-300 pt-2 text-xs text-base-content/70">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{t('Qada')}</span>
                        <span className="tabular-nums">
                            {outstanding > 0
                                ? t(':n outstanding', { n: outstanding })
                                : t('No qada')}
                        </span>
                    </div>
                    <div className="text-[10px] text-base-content/50">
                        {t(':owed owed, :repaid repaid', {
                            owed: qadaOwed,
                            repaid: qadaRepaid,
                        })}
                    </div>
                </div>

                <div className="mt-2 text-end">
                    <Link
                        href={route('salah.index')}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        {t('View details')}
                    </Link>
                </div>

                {total > 0 && (
                    <div className="sr-only">
                        {t('Jamaat')} {breakdown.jamaat} ({pct(breakdown.jamaat)}%),{' '}
                        {t('Alone')} {breakdown.alone} ({pct(breakdown.alone)}%),{' '}
                        {t('Qada')} {breakdown.qada} ({pct(breakdown.qada)}%),{' '}
                        {t('Missed')} {breakdown.missed} ({pct(breakdown.missed)}%).
                    </div>
                )}
            </div>
        </div>
    );
}
