import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import HijriBadge from '@/Components/HijriBadge';
import useTranslation from '@/hooks/useTranslation';

const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const LABELS = {
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
};

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

export default function PrayerTimesBar({ prayerTimes, hijriDate, gregorianDate, hijriEvent }) {
    const { t } = useTranslation();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const next = useMemo(() => {
        if (!prayerTimes) return null;
        const nowMin = now.getHours() * 60 + now.getMinutes();
        for (const key of PRAYER_KEYS) {
            if (toMinutes(prayerTimes[key]) > nowMin) {
                return { key, minutes: toMinutes(prayerTimes[key]) - nowMin };
            }
        }
        // After Isha: next is tomorrow's Fajr.
        return { key: 'fajr', minutes: 24 * 60 - nowMin + toMinutes(prayerTimes.fajr) };
    }, [prayerTimes, now]);

    if (!prayerTimes) {
        return (
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <HijriBadge hijriDate={hijriDate} gregorianDate={gregorianDate} event={hijriEvent} />
                    <Link
                        href={route('settings.edit')}
                        className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                        {t('Set your location to see prayer times')}
                    </Link>
                </div>
            </div>
        );
    }

    const countdown =
        next.minutes >= 60
            ? t(':h h :m min', { h: Math.floor(next.minutes / 60), m: next.minutes % 60 })
            : t(':m min', { m: next.minutes });

    return (
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <HijriBadge hijriDate={hijriDate} gregorianDate={gregorianDate} event={hijriEvent} />
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {t(LABELS[next.key])}
                    </span>{' '}
                    {t('in')} {countdown}
                </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRAYER_KEYS.map((key) => (
                    <div
                        key={key}
                        className={`rounded-md p-2 text-center ${
                            next.key === key
                                ? 'bg-emerald-100 ring-1 ring-emerald-500 dark:bg-emerald-900'
                                : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                    >
                        <div className="text-xs text-gray-500 dark:text-gray-300">{t(LABELS[key])}</div>
                        <div className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                            {prayerTimes[key]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
