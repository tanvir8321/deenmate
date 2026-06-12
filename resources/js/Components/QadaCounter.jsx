import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';

const PRAYER_KEYS = {
    fajr: { kind: 'salah_fajr', label: 'Fajr' },
    dhuhr: { kind: 'salah_dhuhr', label: 'Dhuhr' },
    asr: { kind: 'salah_asr', label: 'Asr' },
    maghrib: { kind: 'salah_maghrib', label: 'Maghrib' },
    isha: { kind: 'salah_isha', label: 'Isha' },
};

function ProgressBar({ pct }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
            <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
        </div>
    );
}

function RepayButton({ kind, onRepaid }) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);

    const handleClick = () => {
        setBusy(true);
        router.post(
            route('salah.repay-qada'),
            { kind, count: 1 },
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => setBusy(false),
                onSuccess: () => onRepaid?.(),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            className="btn btn-xs btn-primary"
            aria-label={t('Repay qada')}
        >
            {busy ? '...' : t('Repaid +1')}
        </button>
    );
}

export default function QadaCounter({ summary = null, full = false }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const csrf = props?.csrf_token;

    if (!summary) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                    <h3 className="text-sm font-medium text-base-content/70">
                        {t('Qada')}
                    </h3>
                    <p className="text-xs text-base-content/50">{t('No qada')}</p>
                </div>
            </div>
        );
    }

    const outstanding = summary.outstanding ?? 0;
    const owed = summary.owed ?? 0;
    const repaid = summary.repaid ?? 0;
    const pct = owed > 0 ? Math.round((repaid / owed) * 100) : 100;

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-base-content/70">
                        {t('Qada')}
                    </h3>
                    <span className="text-xs text-base-content/60">
                        {t(':n outstanding', { n: outstanding })}
                    </span>
                </div>

                <div className="mt-2 space-y-1">
                    <ProgressBar pct={pct} />
                    <div className="flex items-center justify-between text-[11px] text-base-content/60">
                        <span>
                            {t(':owed owed', { owed })}
                        </span>
                        <span>
                            {t(':repaid repaid', { repaid })}
                        </span>
                    </div>
                </div>

                {full && (
                    <div className="mt-3 space-y-2">
                        {Object.entries(PRAYER_KEYS).map(([prayer, { kind, label }]) => {
                            const row = summary.by_prayer?.[prayer] ?? { owed: 0, repaid: 0, outstanding: 0 };
                            return (
                                <div
                                    key={kind}
                                    className="flex items-center justify-between rounded-md bg-base-200 px-3 py-2"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-base-content">
                                            {t(label)}
                                        </span>
                                        <span className="text-[11px] text-base-content/60">
                                            {row.owed} {t('owed')} · {row.repaid} {t('repaid')}
                                        </span>
                                    </div>
                                    {row.outstanding > 0 ? (
                                        <RepayButton kind={kind} />
                                    ) : (
                                        <span className="text-[11px] font-medium text-success">
                                            {t('Done')}
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        {summary.fast && summary.fast.owed > 0 && (
                            <div className="mt-3 border-t border-base-300 pt-3">
                                <div className="flex items-center justify-between rounded-md bg-base-200 px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-base-content">
                                            {t('Fasting')}
                                        </span>
                                        <span className="text-[11px] text-base-content/60">
                                            {summary.fast.owed} {t('owed')} · {summary.fast.repaid} {t('repaid')}
                                        </span>
                                    </div>
                                    {summary.fast.outstanding > 0 ? (
                                        <RepayButton kind="fast" />
                                    ) : (
                                        <span className="text-[11px] font-medium text-success">
                                            {t('Done')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <form action={route('salah.repay-qada')} method="POST" className="hidden">
                            <input type="hidden" name="_token" value={csrf} />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
