import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import useNextPrayer from '@/hooks/useNextPrayer';

const LABELS = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
};

function formatCountdown(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

export default function NextPrayerCountdown({ prayerTimes, hasLocation }) {
    const { t } = useTranslation();
    const next = useNextPrayer(prayerTimes);

    if (!hasLocation || !next) {
        return (
            <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                    <p className="text-sm font-semibold text-base-content/60">{t('Next prayer')}</p>
                    <p className="text-sm text-base-content/70">
                        <Link href={route('settings.edit')} className="link link-primary">
                            {t('Set location for prayer times')}
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-gradient-to-br from-primary to-primary/80 text-primary-content shadow">
            <div className="card-body p-4">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    {t('Next prayer')}{next.isTomorrow ? ' (tomorrow)' : ''}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{t(LABELS[next.name])}</span>
                    <span className="text-sm opacity-80 tabular-nums">{next.hhmm}</span>
                </div>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums">
                    {formatCountdown(next.secondsLeft)}
                </p>
            </div>
        </div>
    );
}
