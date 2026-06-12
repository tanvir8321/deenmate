import { router } from '@inertiajs/react';
import { useState } from 'react';
import useTranslation from '@/hooks/useTranslation';

const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-sky-100 text-sky-700',
    high: 'bg-amber-100 text-amber-800',
    urgent: 'bg-rose-100 text-rose-800',
};

export default function TodoItem({ item, showDate = false }) {
    const { t } = useTranslation();
    const [optimisticDone, setOptimisticDone] = useState(null);
    const done = optimisticDone ?? item.status === 'done';
    const id = item.todo_id ?? item.id;

    const toggle = () => {
        const next = !done;
        setOptimisticDone(next);
        router.post(
            route(next ? 'todos.complete' : 'todos.reopen', id),
            {},
            {
                preserveScroll: true,
                onError: () => setOptimisticDone(!next),
                onFinish: () => setOptimisticDone(null),
            },
        );
    };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <button
                type="button"
                onClick={toggle}
                aria-label={done ? t('Mark as not done') : t('Mark as done')}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                    done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-emerald-400'
                }`}
            >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414l2.792 2.793 6.793-6.793a1 1 0 011.415 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {item.title}
                </p>
                {item.subtasks?.length > 0 && (
                    <p className="text-xs text-gray-400">
                        {item.subtasks.filter((s) => s.status === 'done').length}/{item.subtasks.length}{' '}
                        {t('subtasks')}
                    </p>
                )}
            </div>

            {showDate && item.due_date && (
                <span className="shrink-0 text-xs text-rose-600">{item.due_date}</span>
            )}
            <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs ${PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.normal}`}
            >
                {t(item.priority)}
            </span>
        </div>
    );
}
