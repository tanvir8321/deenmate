import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

function CompletionBar({ pct }) {
    return (
        <div className="flex h-6 w-full overflow-hidden rounded bg-gray-200">
            <div
                className="flex items-center justify-center bg-emerald-500 text-xs font-medium text-white transition-all duration-300"
                style={{ width: `${Math.min(pct, 100)}%` }}
            >
                {pct > 15 ? `${pct}%` : ''}
            </div>
            {pct <= 99 && (
                <span className="ml-2 self-center text-xs text-gray-500">
                    {pct <= 15 ? `${pct}%` : ''}
                </span>
            )}
        </div>
    );
}

function StatCard({ label, value, color = 'bg-blue-500' }) {
    return (
        <div className="flex flex-col items-center rounded-lg border border-gray-200 p-3">
            <span className={`text-2xl font-bold ${color.replace('bg-', 'text-').replace('-500', '-600')}`}>
                {value}
            </span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );
}

function HeatmapGrid({ heatmap, year, months }) {
    const weeks = [];
    const today = new Date().toISOString().slice(0, 10);
    const map = {};
    (heatmap || []).forEach((h) => {
        map[h.date] = h.value;
    });

    const yearStart = new Date(months?.[0]?.date || `${year}-01-01`);
    const startDay = yearStart.getDay() || 7;
    for (let i = 1; i < startDay; i++) {
        weeks.push(null);
    }

    const allDays = [];
    (months || []).forEach((m) => {
        allDays.push(m.date);
    });

    allDays.forEach((date) => {
        weeks.push(date);
    });

    while (weeks.length % 7 !== 0) {
        weeks.push(null);
    }

    const rows = [];
    for (let i = 0; i < weeks.length; i += 7) {
        rows.push(weeks.slice(i, i + 7));
    }

    return (
        <div className="flex gap-1">
            {rows.map((row, ri) => (
                <div key={ri} className="flex flex-col gap-1">
                    {row.map((date, di) => {
                        if (!date) {
                            return <div key={di} className="h-3 w-3 rounded-sm bg-gray-100" />;
                        }
                        const val = map[date] || 0;
                        const colors = [
                            'bg-gray-200',
                            'bg-emerald-200',
                            'bg-emerald-400',
                            'bg-emerald-500',
                            'bg-emerald-600',
                            'bg-emerald-800',
                        ];
                        const isToday = date === today;
                        return (
                            <div
                                key={di}
                                className={`h-3 w-3 rounded-sm ${colors[val]} ${isToday ? 'ring-1 ring-gray-400' : ''}`}
                                title={`${date}: ${val}`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default function Index() {
    const { t } = useTranslation();

    const [tab, setTab] = useState('weekly');
    const [isHijri, setIsHijri] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            const params = new URLSearchParams({ period: tab });

            if (tab === 'weekly') {
                const mon = new Date(now);
                mon.setDate(mon.getDate() - (mon.getDay() || 7) + 1 + offset * 7);
                params.set('week_start', mon.toISOString().slice(0, 10));
            } else if (tab === 'monthly') {
                params.set('is_hijri', isHijri ? '1' : '0');
                const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                params.set('month_start', d.toISOString().slice(0, 10));
            } else {
                params.set('is_hijri', isHijri ? '1' : '0');
                params.set('year', String(now.getFullYear() + offset));
            }

            const res = await fetch(`/reports/data?${params}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch {
            // ignore fetch errors
        } finally {
            setLoading(false);
        }
    }, [tab, isHijri, offset]);

    useEffect(() => {
        setOffset(0);
    }, [tab, isHijri]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const navPrev = () => setOffset((o) => o - 1);
    const navNext = () => setOffset((o) => o + 1);

    const periodLabel = useMemo(() => {
        if (!data) return '';
        if (tab === 'weekly') return `${data.week_start} — ${data.week_end}`;
        if (tab === 'monthly') return data.is_hijri ? data.hijri_month : data.gregorian_month;
        return data.is_hijri ? `AH ${data.year}` : String(data.year);
    }, [data, tab]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('Reports')}
                </h2>
            }
        >
            <Head title={t('Reports')} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="flex items-center justify-between">
                        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                            {['weekly', 'monthly', 'yearly'].map((tabKey) => (
                                <button
                                    key={tabKey}
                                    onClick={() => setTab(tabKey)}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                                        tab === tabKey
                                            ? 'bg-emerald-600 text-white shadow'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {t(`reports.${tabKey}`)}
                                </button>
                            ))}
                        </div>

                        {(tab === 'monthly' || tab === 'yearly') && (
                            <button
                                onClick={() => setIsHijri((h) => !h)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                {isHijri ? t('reports.switch_gregorian') : t('reports.switch_hijri')}
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={navPrev}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            &larr; {t('reports.previous')}
                        </button>
                        <span className="text-sm font-medium text-gray-700">{periodLabel}</span>
                        <button
                            onClick={navNext}
                            disabled={offset === 0}
                            className={`rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 ${
                                offset === 0 ? 'invisible' : ''
                            }`}
                        >
                            {t('reports.next')} &rarr;
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                        </div>
                    )}

                    {!loading && data && (
                        <>
                            {/* Completion trend */}
                            <div className="rounded-lg bg-white p-4 shadow">
                                <h3 className="mb-3 text-sm font-medium text-gray-700">
                                    {t('reports.completion_trend')}
                                </h3>
                                <div className="space-y-2">
                                    {(data.days || []).map((day) => (
                                        <div key={day.date} className="flex items-center gap-2">
                                            <span className="w-20 shrink-0 text-xs text-gray-500">
                                                {day.date.slice(5)}
                                            </span>
                                            <CompletionBar pct={day.completion_pct} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary cards */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <StatCard
                                    label={t('reports.quran_pages')}
                                    value={data.quran_pages ?? 0}
                                    color="bg-emerald-500"
                                />
                                <StatCard
                                    label={t('reports.fasts_completed')}
                                    value={data.fasting_completed ?? 0}
                                    color="bg-amber-500"
                                />
                                <StatCard
                                    label={t('reports.todos_completed')}
                                    value={data.todos_completed ?? 0}
                                    color="bg-blue-500"
                                />
                                <StatCard
                                    label={t('reports.current_streak')}
                                    value={data.current_streak ?? 0}
                                    color="bg-purple-500"
                                />
                            </div>

                            {/* Salah breakdown */}
                            {data.salah_breakdown && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                                        {t('reports.salah_breakdown')}
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        <StatCard
                                            label={t('reports.jamaat')}
                                            value={data.salah_breakdown.jamaat ?? 0}
                                            color="bg-emerald-500"
                                        />
                                        <StatCard
                                            label={t('reports.alone')}
                                            value={data.salah_breakdown.alone ?? 0}
                                            color="bg-blue-500"
                                        />
                                        <StatCard
                                            label={t('reports.qada')}
                                            value={data.salah_breakdown.qada ?? 0}
                                            color="bg-amber-500"
                                        />
                                        <StatCard
                                            label={t('reports.missed')}
                                            value={data.salah_breakdown.missed ?? 0}
                                            color="bg-red-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Yearly heatmap */}
                            {tab === 'yearly' && data.streak_heatmap && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                                        {t('reports.year_heatmap')}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <HeatmapGrid
                                            heatmap={data.streak_heatmap}
                                            year={data.year}
                                            months={data.days || data.months}
                                            isHijri={isHijri}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Goals */}
                            {tab === 'yearly' && data.goals && data.goals.length > 0 && (
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                                        {t('Goals')}
                                    </h3>
                                    <div className="space-y-3">
                                        {data.goals.map((goal, i) => {
                                            const pct = goal.target > 0
                                                ? Math.min(Math.round((goal.current / goal.target) * 100), 100)
                                                : 0;
                                            return (
                                                <div key={i}>
                                                    <div className="mb-1 flex justify-between text-xs text-gray-600">
                                                        <span>{goal.title}</span>
                                                        <span>
                                                            {goal.current} / {goal.target} {goal.unit}
                                                        </span>
                                                    </div>
                                                    <CompletionBar pct={pct} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Export buttons */}
                            <div className="rounded-lg bg-white p-4 shadow">
                                <h3 className="mb-3 text-sm font-medium text-gray-700">
                                    {t('reports.export')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <a
                                        href={route('export.salah', { format: 'xlsx' })}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        {t('reports.export_salah_xlsx')}
                                    </a>
                                    <a
                                        href={route('export.tasks', { format: 'xlsx' })}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        {t('reports.export_tasks_xlsx')}
                                    </a>
                                    <a
                                        href={route('export.quran', { format: 'xlsx' })}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        {t('reports.export_quran_xlsx')}
                                    </a>
                                    <a
                                        href={route('export.full', { format: 'json' })}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        {t('reports.export_full_json')}
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
