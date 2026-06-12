import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

function describeRule(rule, t) {
    switch (rule.freq) {
        case 'daily':
            return t('Every day');
        case 'weekly':
            return `${t('Weekly')}: ${(rule.days ?? []).map((d) => t(d)).join(', ')}`;
        case 'monthly':
            return t('Monthly on day :d', { d: rule.day_of_month });
        case 'yearly':
            return t('Yearly on :m/:d', { m: rule.month, d: rule.day });
        case 'hijri_monthly':
            return t('Hijri days :d each month', { d: (rule.hijri_days ?? []).join(', ') });
        case 'hijri_yearly':
            return rule.hijri_day
                ? t('Hijri :m/:d every year', { m: rule.hijri_month, d: rule.hijri_day })
                : t('All of Hijri month :m', { m: rule.hijri_month });
        case 'interval':
            return t('Every :n days', { n: rule.every_days });
        default:
            return '';
    }
}

export default function Index({ routines }) {
    const { t } = useTranslation();

    const destroy = (routine) => {
        if (confirm(t('Delete this routine? Past history is kept.'))) {
            router.delete(route('routines.destroy', routine.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {t('Routines')}
                    </h2>
                    <Link href={route('routines.create')}>
                        <PrimaryButton>{t('New routine')}</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={t('Routines')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-3 px-4 sm:px-6 lg:px-8">
                    {routines.length === 0 && (
                        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                            {t('No routines yet. Create your first recurring deed.')}
                        </div>
                    )}

                    {routines.map((routine) => (
                        <div
                            key={routine.id}
                            className={`flex items-center gap-3 rounded-lg bg-white p-4 shadow ${
                                routine.is_active ? '' : 'opacity-60'
                            }`}
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-gray-900">{routine.title}</p>
                                <p className="text-sm text-gray-500">
                                    {describeRule(routine.recurrence, t)}
                                    {routine.anchor &&
                                        ` · ${t(routine.anchor)}${
                                            routine.offset_minutes
                                                ? ` ${routine.offset_minutes > 0 ? '+' : ''}${routine.offset_minutes} ${t('min')}`
                                                : ''
                                        }`}
                                    {routine.fixed_time && ` · ${routine.fixed_time}`}
                                    {routine.reminder_enabled && ` · 🔔`}
                                </p>
                            </div>
                            {!routine.is_active && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                    {t('Paused')}
                                </span>
                            )}
                            <Link
                                href={route('routines.edit', routine.id)}
                                className="text-sm font-medium text-emerald-600 hover:underline"
                            >
                                {t('Edit')}
                            </Link>
                            <button
                                type="button"
                                onClick={() => destroy(routine)}
                                className="text-sm text-rose-500 hover:underline"
                            >
                                {t('Delete')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
