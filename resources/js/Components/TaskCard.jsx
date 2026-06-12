import useTranslation from '@/hooks/useTranslation';

const CATEGORY_COLORS = {
    salah: 'bg-emerald-100 text-emerald-800',
    adhkar: 'bg-sky-100 text-sky-800',
    quran: 'bg-violet-100 text-violet-800',
    fasting: 'bg-amber-100 text-amber-800',
    finance: 'bg-rose-100 text-rose-800',
    general: 'bg-gray-100 text-gray-700',
};

export default function TaskCard({ item, onComplete, onSkip, onUndo }) {
    const { t } = useTranslation();
    const done = item.status === 'done';
    const skipped = item.status === 'skipped';
    const missed = item.status === 'missed';
    const acted = done || skipped || missed;

    return (
        <div
            className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                done
                    ? 'border-emerald-200 bg-emerald-50'
                    : skipped || missed
                      ? 'border-gray-200 bg-gray-50 opacity-70'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
        >
            <button
                type="button"
                onClick={() => (acted ? onUndo(item) : onComplete(item))}
                aria-label={done ? t('Mark as not done') : t('Mark as done')}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-emerald-400'
                }`}
            >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414l2.792 2.793 6.793-6.793a1 1 0 011.415 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="min-w-0 flex-1">
                <p
                    className={`truncate text-sm font-medium ${
                        done ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                >
                    {item.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    {item.time && <span className="tabular-nums">{item.time}</span>}
                    <span className={`rounded-full px-1.5 py-0.5 ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.general}`}>
                        {t(item.category)}
                    </span>
                    {skipped && <span className="text-amber-600">{t('skipped')}</span>}
                    {missed && <span className="text-rose-600">{t('missed')}</span>}
                </div>
            </div>

            {!acted && (
                <button
                    type="button"
                    onClick={() => onSkip(item)}
                    className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
                >
                    {t('Skip')}
                </button>
            )}
        </div>
    );
}
