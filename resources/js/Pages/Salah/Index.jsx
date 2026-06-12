import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import HijriBadge from '@/Components/HijriBadge';
import useTranslation from '@/hooks/useTranslation';

const PRAYERS = [
    { key: 'fajr', label: 'Fajr', arabic: 'الفجر' },
    { key: 'dhuhr', label: 'Dhuhr', arabic: 'الظهر' },
    { key: 'asr', label: 'Asr', arabic: 'العصر' },
    { key: 'maghrib', label: 'Maghrib', arabic: 'المغرب' },
    { key: 'isha', label: 'Isha', arabic: 'العشاء' },
];

const STATUS_LABELS = {
    jamaat: 'Jamaat',
    alone: 'Alone',
    qada: 'Qada',
    missed: 'Missed',
};

const STATUS_COLORS = {
    jamaat: 'bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-900 dark:text-emerald-200',
    alone: 'bg-blue-100 text-blue-800 ring-blue-300 dark:bg-blue-900 dark:text-blue-200',
    qada: 'bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-900 dark:text-amber-200',
    missed: 'bg-red-100 text-red-800 ring-red-300 dark:bg-red-900 dark:text-red-200',
    '': 'bg-gray-100 text-gray-600 ring-gray-300 dark:bg-gray-700 dark:text-gray-300',
};

function PrayerCard({ prayer, currentStatus, onStatusChange }) {
    const { t } = useTranslation();
    const statuses = ['jamaat', 'alone', 'qada', 'missed'];

    return (
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {t(prayer.label)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                        {prayer.arabic}
                    </span>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${
                        STATUS_COLORS[currentStatus] || STATUS_COLORS['']
                    }`}
                >
                    {currentStatus ? t(STATUS_LABELS[currentStatus]) : t('Not recorded')}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => onStatusChange(status)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                            currentStatus === status
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                        aria-label={t('Mark :prayer as :status', { prayer: prayer.label, status: STATUS_LABELS[status] })}
                    >
                        {t(STATUS_LABELS[status])}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function Index({ prayerTimes, todayLogs, currentStreak, hijriDate, hijriEvent, gregorianDate, weeklyCount }) {
    const { t } = useTranslation();
    const todayLogMap = PRAYERS.reduce((acc, prayer) => {
        acc[prayer.key] = todayLogs?.[prayer.key]?.status || '';
        return acc;
    }, {});

    const { post } = useForm({
        date: gregorianDate,
        prayer: '',
        status: '',
    });

    const handleStatusChange = (prayer, status) => {
        post(route('salah.store'), {
            data: { date: gregorianDate, prayer, status },
            preserveScroll: true,
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Salah Tracking')}
                </h2>
            }
        >
            <Head title={t('Salah Tracking')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <HijriBadge
                            hijriDate={hijriDate}
                            gregorianDate={gregorianDate}
                            event={hijriEvent}
                        />
                    </div>

                    {prayerTimes && (
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                {t('Prayer Times')}
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {PRAYERS.map((prayer) => (
                                    <div
                                        key={prayer.key}
                                        className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700"
                                    >
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {t(prayer.label)}
                                        </div>
                                        <div className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                                            {prayerTimes[prayer.key]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t('Current Streak')}
                            </div>
                            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {currentStreak} {currentStreak === 1 ? t('day') : t('days')}
                            </div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t('This Week')}
                            </div>
                            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {weeklyCount} / 35
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {t("Today's Salah")}
                        </h3>
                        <div className="space-y-3">
                            {PRAYERS.map((prayer) => (
                                <PrayerCard
                                    key={prayer.key}
                                    prayer={prayer}
                                    currentStatus={todayLogMap[prayer.key]}
                                    onStatusChange={(status) => handleStatusChange(prayer.key, status)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}