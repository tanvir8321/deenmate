import { Link } from '@inertiajs/react';
import GoalRing from '@/Components/GoalRing';
import useTranslation from '@/hooks/useTranslation';

const COLOR = {
    salah_jamaat: 'secondary',
    quran_pages: 'warning',
    adhkar_count: 'success',
    fasting: 'info',
    other: 'primary',
};

export default function GoalsCarousel({ goals = [] }) {
    const { t } = useTranslation();
    if (goals.length === 0) {
        return null;
    }
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="card-title text-sm font-semibold text-base-content/70">
                        {t('Goals')}
                    </h2>
                    <Link
                        href={route('goals.index')}
                        className="link link-primary text-xs font-medium"
                    >
                        {t('View all')}
                    </Link>
                </div>
                <div className="-mx-1 flex flex-wrap gap-4 overflow-x-auto px-1 pb-1">
                    {goals.map((goal) => (
                        <GoalRing
                            key={goal.id}
                            current={goal.current_value}
                            target={goal.target_value}
                            label={goal.title}
                            color={COLOR[goal.metric_source] ?? COLOR.other}
                            size={72}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
