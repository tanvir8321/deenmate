import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
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
    jamaat: 'badge-success',
    alone: 'badge-info',
    qada: 'badge-warning',
    missed: 'badge-error',
    '': 'badge-neutral',
};

function PrayerCard({ prayer, currentStatus, onStatusChange }) {
    const { t } = useTranslation();
    const statuses = ['jamaat', 'alone', 'qada', 'missed'];

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-base-content">
                            {t(prayer.label)}
                        </span>
                        <span className="text-sm text-base-content/60" dir="rtl">
                            {prayer.arabic}
                        </span>
                    </div>
                    <span
                        className={`badge ${STATUS_COLORS[currentStatus] || STATUS_COLORS['']}`}
                    >
                        {currentStatus ? t(STATUS_LABELS[currentStatus]) : t('Not recorded')}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
                            className={`btn btn-sm ${currentStatus === status ? 'btn-primary' : 'btn-outline'}`}
                            aria-label={t('Mark :prayer as :status', { prayer: prayer.label, status: STATUS_LABELS[status] })}
                        >
                            {t(STATUS_LABELS[status])}
                        </button>
                    ))}
                </div>
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
                <h2 className="text-xl font-semibold leading-tight text-base-content">
                    {t('Salah Tracking')}
                </h2>
            }
        >
            <Head title={t('Salah Tracking')} />

            <Container className="space-y-4 py-2">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body p-4">
                            <HijriBadge
                                hijriDate={hijriDate}
                                gregorianDate={gregorianDate}
                                event={hijriEvent}
                            />
                        </div>
                    </div>

                    {prayerTimes && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-4">
                                <div className="mb-3 text-sm font-medium text-base-content/70">
                                    {t('Prayer Times')}
                                </div>
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {PRAYERS.map((prayer) => (
                                        <div
                                            key={prayer.key}
                                            className="rounded-md bg-base-200 p-2 text-center"
                                        >
                                            <div className="text-xs text-base-content/60">
                                                {t(prayer.label)}
                                            </div>
                                            <div className="text-sm font-semibold tabular-nums text-base-content">
                                                {prayerTimes[prayer.key]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="stat card bg-base-100 shadow">
                            <div className="stat-title text-base-content/60">{t('Current Streak')}</div>
                            <div className="stat-value text-2xl text-success">
                                {currentStreak} {currentStreak === 1 ? t('day') : t('days')}
                            </div>
                        </div>
                        <div className="stat card bg-base-100 shadow">
                            <div className="stat-title text-base-content/60">{t('This Week')}</div>
                            <div className="stat-value text-2xl text-success">
                                {weeklyCount} / 35
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-base-content">
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
            </Container>
        </AuthenticatedLayout>
    );
}