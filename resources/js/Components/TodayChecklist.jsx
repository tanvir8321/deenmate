import { router } from '@inertiajs/react';
import { useState } from 'react';
import TaskCard from '@/Components/TaskCard';
import TodoItem from '@/Components/TodoItem';
import useTranslation from '@/hooks/useTranslation';

const BUCKETS = [
    ['pre_fajr', 'Pre-Fajr'],
    ['after_fajr', 'After Fajr'],
    ['midday', 'Midday'],
    ['after_asr', 'After Asr'],
    ['after_maghrib', 'After Maghrib'],
    ['after_isha', 'After Isha'],
    ['anytime', 'Anytime'],
];

export default function TodayChecklist({ day, date }) {
    const { t } = useTranslation();
    // Optimistic status overrides keyed by routine_id; cleared on error.
    const [optimistic, setOptimistic] = useState({});

    const act = (routeName, item, status) => {
        setOptimistic((prev) => ({ ...prev, [item.routine_id]: status }));
        router.post(
            route(routeName),
            { routine_id: item.routine_id, date },
            {
                preserveScroll: true,
                onError: () =>
                    setOptimistic((prev) => {
                        const next = { ...prev };
                        delete next[item.routine_id];
                        return next;
                    }),
            },
        );
    };

    const routines = day.routines.map((item) => ({
        ...item,
        status: optimistic[item.routine_id] ?? item.status,
    }));

    const grouped = BUCKETS.map(([key, label]) => [
        key,
        label,
        routines.filter((r) => r.bucket === key),
    ]).filter(([, , items]) => items.length > 0);

    const doneCount = routines.filter((r) => r.status === 'done').length;

    return (
        <div className="space-y-6">
            {day.overdue.length > 0 && (
                <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-rose-800">{t('Overdue')}</h3>
                    <div className="space-y-2">
                        {day.overdue.map((todoItem) => (
                            <TodoItem key={todoItem.todo_id} item={todoItem} showDate />
                        ))}
                    </div>
                </section>
            )}

            <section className="rounded-lg bg-white p-4 shadow">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{t('Routine checklist')}</h3>
                    {routines.length > 0 && (
                        <span className="text-sm text-gray-500">
                            {doneCount}/{routines.length}
                        </span>
                    )}
                </div>

                {routines.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">
                        {t('No routines for today. Create one to build your daily checklist.')}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {grouped.map(([key, label, items]) => (
                            <div key={key}>
                                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {t(label)}
                                </h4>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <TaskCard
                                            key={item.routine_id}
                                            item={item}
                                            onComplete={(i) => act('tasks.complete', i, 'done')}
                                            onSkip={(i) => act('tasks.skip', i, 'skipped')}
                                            onUndo={(i) => act('tasks.undo', i, 'pending')}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-lg bg-white p-4 shadow">
                <h3 className="mb-3 text-base font-semibold text-gray-900">{t('Todos')}</h3>
                {day.todos.length === 0 ? (
                    <p className="py-2 text-center text-sm text-gray-500">{t('No todos due today.')}</p>
                ) : (
                    <div className="space-y-2">
                        {day.todos.map((todoItem) => (
                            <TodoItem key={todoItem.todo_id} item={todoItem} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
