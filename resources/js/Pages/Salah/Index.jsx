import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import HijriBadge from '@/Components/HijriBadge';
import QadaCounter from '@/Components/QadaCounter';
import SalahMonthlyChart from '@/Components/SalahMonthlyChart';
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

// GitHub-style 5-step green ramp on a neutral surface.
const INTENSITY_BG = [
    'bg-base-300',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-500',
    'bg-emerald-600 dark:bg-emerald-400',
    'bg-emerald-700 dark:bg-emerald-300',
];

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_VISIBLE = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

const MONTH_LABELS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function ActivityHeatmap({ cells = [] }) {
    const { t } = useTranslation();

    const { weeks, totalActiveDays, activeDayCount, maxStreak, monthLabels } = useMemo(() => {
        if (cells.length === 0) {
            return { weeks: [], totalActiveDays: 0, activeDayCount: 0, maxStreak: 0, monthLabels: [] };
        }

        const first = new Date(cells[0].date + 'T00:00:00');
        const firstDow = first.getDay();

        const padded = [];
        for (let i = 0; i < firstDow; i++) {
            padded.push(null);
        }
        for (const c of cells) {
            padded.push(c);
        }
        while (padded.length % 7 !== 0) {
            padded.push(null);
        }

        const weekCols = [];
        for (let i = 0; i < padded.length; i += 7) {
            weekCols.push(padded.slice(i, i + 7));
        }

        const monthMap = {};
        weekCols.forEach((week, wi) => {
            const dayWithDate = week.find((d) => d !== null);
            if (dayWithDate) {
                const d = new Date(dayWithDate.date + 'T00:00:00');
                const m = d.getMonth();
                if (!(m in monthMap)) {
                    monthMap[m] = { wi, label: MONTH_LABELS[m] };
                }
            }
        });
        const monthList = Object.values(monthMap);

        let total = 0;
        let active = 0;
        let longest = 0;
        let run = 0;
        for (const c of cells) {
            total += c.value;
            if (c.value > 0) {
                active++;
                run++;
                if (run > longest) longest = run;
            } else {
                run = 0;
            }
        }

        return {
            weeks: weekCols,
            totalActiveDays: total,
            activeDayCount: active,
            maxStreak: longest,
            monthLabels: monthList,
        };
    }, [cells]);

    if (cells.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="text-xs text-base-content/70">
                <span className="font-semibold text-base-content">
                    {totalActiveDays}
                </span>{' '}
                {t('prayers on time in the last 90 days')}
                <span className="ms-2 text-base-content/50">
                    · {t(':n active days', { n: activeDayCount })}
                    {' · '}
                    {t('Longest streak: :n', { n: maxStreak })}
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Month labels row */}
                    <div
                        className="grid gap-[3px] ps-8 text-[10px] text-base-content/50"
                        style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
                    >
                        {weeks.map((_, wi) => {
                            const m = monthLabels.find((x) => x.wi === wi);
                            return (
                                <div key={wi} className="h-3 text-start">
                                    {m ? m.label : ''}
                                </div>
                            );
                        })}
                    </div>

                    {/* Day-of-week labels + cells grid */}
                    <div className="mt-1 flex">
                        <div className="flex w-8 flex-col gap-[3px] pt-0 text-[10px] text-base-content/50">
                            {DOW_LABELS.map((d, i) => (
                                <div
                                    key={d}
                                    className="h-3 leading-3"
                                    style={{ visibility: DOW_VISIBLE[i] ? 'visible' : 'hidden' }}
                                >
                                    {DOW_VISIBLE[i]}
                                </div>
                            ))}
                        </div>
                        <div
                            className="grid gap-[3px]"
                            style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
                        >
                            {weeks.map((week, wi) =>
                                week.map((cell, di) => {
                                    if (cell === null) {
                                        return <div key={`${wi}-${di}`} className="h-3 w-3" />;
                                    }
                                    const level = Math.min(5, Math.max(0, cell.value));
                                    return (
                                        <div
                                            key={cell.date}
                                            title={`${cell.date} \u2014 ${cell.value} prayers on time`}
                                            aria-label={`${cell.date}: ${cell.value} prayers on time`}
                                            className={`h-3 w-3 rounded-[2px] ${INTENSITY_BG[level]}`}
                                        />
                                    );
                                }),
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-[10px] text-base-content/50">
                <span>{t('Less')}</span>
                {INTENSITY_BG.map((cls, i) => (
                    <span
                        key={i}
                        className={`inline-block h-3 w-3 rounded-[2px] ${cls}`}
                        title={`${i} prayers on time`}
                    />
                ))}
                <span>{t('More')}</span>
            </div>
        </div>
    );
}

function PerPrayerRow({ prayer, stats }) {
    const { t } = useTranslation();
    const pct = stats.pct ?? 0;

    return (
        <tr>
            <td className="px-3 py-2 text-sm font-medium text-base-content">
                {t(prayer.label)}
            </td>
            <td className="px-3 py-2 text-sm tabular-nums text-success">
                {stats.jamaat}
            </td>
            <td className="px-3 py-2 text-sm tabular-nums text-info">
                {stats.alone}
            </td>
            <td className="px-3 py-2 text-sm tabular-nums text-warning">
                {stats.qada}
            </td>
            <td className="px-3 py-2 text-sm tabular-nums text-error">
                {stats.missed}
            </td>
            <td className="px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-base-300">
                        <div
                            className="h-full bg-success"
                            style={{ width: `${Math.min(100, pct)}%` }}
                        />
                    </div>
                    <span className="w-10 text-end text-xs tabular-nums text-base-content/70">
                        {pct}%
                    </span>
                </div>
            </td>
        </tr>
    );
}

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

export default function Index({
    prayerTimes,
    todayLogs,
    currentStreak,
    hijriDate,
    hijriEvent,
    gregorianDate,
    weeklyCount,
    heatmap = [],
    perPrayer = {},
    monthlyBreakdown = [],
    qadaSummary = null,
}) {
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

                    {heatmap.length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-4">
                                <h3 className="text-sm font-semibold text-base-content/70">
                                    {t('90-day activity')}
                                </h3>
                                <div className="mt-3">
                                    <ActivityHeatmap cells={heatmap} />
                                </div>
                            </div>
                        </div>
                    )}

                    {Object.keys(perPrayer).length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-4">
                                <h3 className="text-sm font-semibold text-base-content/70">
                                    {t('Per prayer (last 30 days)')}
                                </h3>
                                <div className="mt-2 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase text-base-content/50">
                                                <th className="px-3 py-2 text-start">{t('Prayer')}</th>
                                                <th className="px-3 py-2 text-start">{t('Jamaat')}</th>
                                                <th className="px-3 py-2 text-start">{t('Alone')}</th>
                                                <th className="px-3 py-2 text-start">{t('Qada')}</th>
                                                <th className="px-3 py-2 text-start">{t('Missed')}</th>
                                                <th className="px-3 py-2 text-start">{t('On time')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {PRAYERS.map((prayer) => (
                                                <PerPrayerRow
                                                    key={prayer.key}
                                                    prayer={prayer}
                                                    stats={perPrayer[prayer.key] ?? {
                                                        jamaat: 0,
                                                        alone: 0,
                                                        qada: 0,
                                                        missed: 0,
                                                        pct: 0,
                                                    }}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {monthlyBreakdown.length > 0 && (
                        <SalahMonthlyChart months={monthlyBreakdown} />
                    )}

                    <QadaCounter summary={qadaSummary} full />
            </Container>
        </AuthenticatedLayout>
    );
}