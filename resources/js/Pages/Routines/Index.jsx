import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
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
                    <h2 className="text-xl font-semibold text-base-content">
                        {t('Routines')}
                    </h2>
                    <Link href={route('routines.create')}>
                        <PrimaryButton>{t('New routine')}</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title={t('Routines')} />

            <Container className="space-y-4 py-2">
                    {routines.length === 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-8 text-center text-base-content/60">
                                {t('No routines yet. Create your first recurring deed.')}
                            </div>
                        </div>
                    )}

                    {routines.map((routine) => (
                        <div
                            key={routine.id}
                            className={`card bg-base-100 shadow ${!routine.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className="card-body flex-row items-center gap-3 p-4">
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-base-content">{routine.title}</p>
                                <p className="text-sm text-base-content/60">
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
                                <span className="badge badge-neutral badge-sm">
                                    {t('Paused')}
                                </span>
                            )}
                            <Link
                                href={route('routines.edit', routine.id)}
                                className="link link-primary text-sm font-medium"
                            >
                                {t('Edit')}
                            </Link>
                            <button
                                type="button"
                                onClick={() => destroy(routine)}
                                className="link link-error text-sm"
                            >
                                {t('Delete')}
                            </button>
                            </div>
                        </div>
                    ))}
            </Container>
        </AuthenticatedLayout>
    );
}
