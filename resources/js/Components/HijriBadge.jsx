import useTranslation from '@/hooks/useTranslation';

const HIJRI_MONTHS = [
    'Muharram',
    'Safar',
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    'Jumada al-Ula',
    'Jumada al-Akhirah',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhul-Qa'dah",
    'Dhul-Hijjah',
];

export default function HijriBadge({ hijriDate, gregorianDate, event }) {
    const { t, locale } = useTranslation();

    if (!hijriDate) return null;

    const monthName = t(HIJRI_MONTHS[hijriDate.month - 1]);
    const gregorian = new Date(`${gregorianDate}T00:00:00`).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {hijriDate.day} {monthName} {hijriDate.year} {t('AH')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{gregorian}</span>
            {event && (
                <span className="mt-0.5 inline-block w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {t(event)}
                </span>
            )}
        </div>
    );
}
