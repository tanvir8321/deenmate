import { Head, Link } from '@inertiajs/react';
import PrayerTimesBar from '@/Components/PrayerTimesBar';
import QuickAddTodo from '@/Components/QuickAddTodo';
import TodayChecklist from '@/Components/TodayChecklist';
import GoalRing from '@/Components/GoalRing';
import StreakHeatmap from '@/Components/StreakHeatmap';
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
}) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('Today')}
                </h2>
            }
        >
            <Head title={t('Today')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <PrayerTimesBar
                        prayerTimes={prayerTimes}
                        hijriDate={hijriDate}
                        gregorianDate={gregorianDate}
                        hijriEvent={hijriEvent}
                    />

                    {stats && (
                        <div className="rounded-lg bg-white p-4 shadow">
                            <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('This week')}</h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-emerald-700">{stats.completion_pct}%</p>
                                    <p className="text-xs text-emerald-600">{t('Completed')}</p>
                                </div>
                                <div className="rounded-lg bg-blue-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{stats.salah_jamaat_count}</p>
                                    <p className="text-xs text-blue-600">{t('Jamaat')}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-amber-700">{stats.quran_pages}</p>
                                    <p className="text-xs text-amber-600">{t('Quran pages')}</p>
                                </div>
                                <div className="rounded-lg bg-violet-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-violet-700">{stats.current_streak}</p>
                                    <p className="text-xs text-violet-600">{t('Day streak')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {goals && goals.length > 0 && (
                        <div className="rounded-lg bg-white p-4 shadow">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">{t('Goals')}</h3>
                                <Link
                                    href={route('goals.index')}
                                    className="text-xs font-medium text-emerald-600 hover:underline"
                                >
                                    {t('View all')}
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {goals.map((goal) => (
                                    <GoalRing
                                        key={goal.id}
                                        current={goal.current_value}
                                        target={goal.target_value}
                                        label={goal.title}
                                        color={
                                            goal.metric_source === 'salah_jamaat'
                                                ? 'blue'
                                                : goal.metric_source === 'quran_pages'
                                                  ? 'amber'
                                                  : 'emerald'
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-4 shadow">
                        <StreakHeatmap dates={heatmapDates} />
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow">
                        <QuickAddTodo />
                    </div>

                    <TodayChecklist day={day} date={gregorianDate} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
