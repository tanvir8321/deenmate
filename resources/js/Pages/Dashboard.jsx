import { Head, Link } from '@inertiajs/react';
import PrayerTimesBar from '@/Components/PrayerTimesBar';
import QuickAddTodo from '@/Components/QuickAddTodo';
import TodayChecklist from '@/Components/TodayChecklist';
import StreakHeatmap from '@/Components/StreakHeatmap';
import SalahActivityCard from '@/Components/SalahActivityCard';
import NextPrayerCountdown from '@/Components/NextPrayerCountdown';
import KpiCard from '@/Components/KpiCard';
import DashboardHeader from '@/Components/DashboardHeader';
import GoalsCarousel from '@/Components/GoalsCarousel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

export default function Dashboard({
    prayerTimes,
    hijriDate,
    hijriEvent,
    gregorianDate,
    day,
    stats,
    goals,
    heatmapDates,
    hasLocation,
    salahHeatmap,
    salahBreakdown,
    salahStreak,
    qadaSummary,
}) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-base-content">{t('Today')}</h2>
            }
        >
            <Head title={t('Today')} />

            <div className="mx-auto max-w-7xl space-y-4">
                <DashboardHeader
                    title={t('Today')}
                    hijriDate={hijriDate}
                    hijriEvent={hijriEvent}
                    gregorianDate={gregorianDate}
                    hasLocation={hasLocation}
                />

                {stats && (
                    <div className="stats stats-vertical w-full shadow sm:stats-horizontal">
                        <KpiCard
                            title={t('Completed')}
                            value={stats.completion_pct}
                            suffix="%"
                            color="primary"
                            sublabel={t('This week')}
                        />
                        <KpiCard
                            title={t('Jamaat')}
                            value={stats.salah_jamaat_count}
                            color="secondary"
                            sublabel={t('Salah')}
                        />
                        <KpiCard
                            title={t('Quran pages')}
                            value={stats.quran_pages}
                            color="warning"
                            sublabel={t('Today')}
                        />
                        <KpiCard
                            title={t('Streak')}
                            value={stats.current_streak}
                            color="info"
                            sublabel={t('days streak')}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <PrayerTimesBar
                            prayerTimes={prayerTimes}
                            hijriDate={hijriDate}
                            gregorianDate={gregorianDate}
                            hijriEvent={hijriEvent}
                        />

                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-4">
                                <h2 className="card-title text-sm font-semibold text-base-content/70">
                                    {t('Quick add')}
                                </h2>
                                <QuickAddTodo />
                            </div>
                        </div>

                        <TodayChecklist day={day} date={gregorianDate} />
                    </div>

                    <div className="space-y-4">
                        <NextPrayerCountdown
                            prayerTimes={prayerTimes}
                            hasLocation={hasLocation}
                        />

                        <GoalsCarousel goals={goals} />

                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-4">
                                <h2 className="card-title text-sm font-semibold text-base-content/70">
                                    {t('Activity')}
                                </h2>
                                <StreakHeatmap dates={heatmapDates} />
                            </div>
                        </div>

                        <SalahActivityCard
                            heatmap={salahHeatmap}
                            breakdown={salahBreakdown}
                            streak={salahStreak}
                            qadaSummary={qadaSummary}
                        />

                        {goals && goals.length > 0 && (
                            <div className="card bg-base-100 shadow">
                                <div className="card-body p-4">
                                    <Link
                                        href={route('goals.index')}
                                        className="link link-primary text-sm font-medium"
                                    >
                                        {t('View all goals')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
