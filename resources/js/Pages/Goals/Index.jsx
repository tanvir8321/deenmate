import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import GoalRing from '@/Components/GoalRing';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import useTranslation from '@/hooks/useTranslation';

const PERIOD_OPTIONS = ['daily', 'monthly', 'yearly'];
const BASIS_OPTIONS = ['gregorian', 'hijri'];
const UNIT_OPTIONS = ['count', 'pages', 'amount', 'days'];
const METRIC_OPTIONS = ['routine_completions', 'salah_jamaat', 'quran_pages', 'fasts', 'manual'];

function emptyGoal() {
    return {
        title: '',
        period: 'daily',
        period_basis: 'gregorian',
        target_value: 1,
        unit: 'count',
        metric_source: 'manual',
        linked_routine_ids: [],
        starts_on: new Date().toISOString().slice(0, 10),
        ends_on: '',
    };
}

export default function Index({ goals }) {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [periodFilter, setPeriodFilter] = useState('all');

    const { data, setData, post, put, processing, errors, reset } = useForm(emptyGoal());

    const filteredGoals = periodFilter === 'all'
        ? goals
        : goals.filter((g) => g.period === periodFilter);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(emptyGoal());
        setShowForm(true);
    };

    const openEdit = (goal) => {
        setEditing(goal.id);
        setData({
            title: goal.title,
            period: goal.period,
            period_basis: goal.period_basis,
            target_value: goal.target_value,
            unit: goal.unit,
            metric_source: goal.metric_source,
            linked_routine_ids: goal.linked_routine_ids ?? [],
            starts_on: goal.starts_on,
            ends_on: goal.ends_on ?? '',
        });
        setShowForm(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...data };
        if (payload.ends_on === '') payload.ends_on = null;

        if (editing) {
            put(route('goals.update', editing), {
                ...payload,
                _method: 'put',
                onSuccess: () => closeForm(),
            });
        } else {
            post(route('goals.store'), {
                ...payload,
                onSuccess: () => closeForm(),
            });
        }
    };

    const destroy = (goal) => {
        if (confirm(t('Delete this goal? Progress data will also be removed.'))) {
            router.delete(route('goals.destroy', goal.id), { preserveScroll: true });
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        reset();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-base-content">
                        {t('Goals')}
                    </h2>
                    <PrimaryButton onClick={openCreate}>{t('New goal')}</PrimaryButton>
                </div>
            }
        >
            <Head title={t('Goals')} />

            <Container className="space-y-4 py-2">
                    {goals.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {['all', 'daily', 'monthly', 'yearly'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPeriodFilter(p)}
                                    className={`btn btn-sm ${
                                        periodFilter === p ? 'btn-primary' : 'btn-outline'
                                    }`}
                                >
                                    {p === 'all' ? t('All') : t(p)}
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredGoals.length === 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-8 text-center text-base-content/60">
                                {t('No goals yet. Set a target to track your progress.')}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className="card bg-base-100 shadow"
                            >
                                <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-base-content">{goal.title}</p>
                                        <p className="text-xs text-base-content/60">
                                            {t(goal.period)} · {t(goal.metric_source)}
                                            {goal.period_basis === 'hijri' && ` (${t('Hijri')})`}
                                        </p>
                                    </div>
                                    <div className="ms-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(goal)}
                                            className="link link-primary text-xs font-medium"
                                        >
                                            {t('Edit')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => destroy(goal)}
                                            className="link link-error text-xs"
                                        >
                                            {t('Delete')}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <GoalRing
                                        current={goal.current_value}
                                        target={goal.target_value}
                                        label=""
                                        color={
                                            goal.metric_source === 'salah_jamaat'
                                                ? 'blue'
                                                : goal.metric_source === 'quran_pages'
                                                  ? 'amber'
                                                  : 'emerald'
                                        }
                                    />
                                </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Modal show={showForm} onClose={closeForm}>
                        <form onSubmit={submit} className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-base-content">
                                {editing ? t('Edit goal') : t('New goal')}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="title" value={t('Title')} />
                                    <TextInput
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="period" value={t('Period')} />
                                        <select
                                            id="period"
                                            value={data.period}
                                            onChange={(e) => setData('period', e.target.value)}
                                            className="select select-bordered mt-1 w-full"
                                        >
                                            {PERIOD_OPTIONS.map((p) => (
                                                <option key={p} value={p}>{t(p)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="period_basis" value={t('Calendar')} />
                                        <select
                                            id="period_basis"
                                            value={data.period_basis}
                                            onChange={(e) => setData('period_basis', e.target.value)}
                                            className="select select-bordered mt-1 w-full"
                                        >
                                            {BASIS_OPTIONS.map((b) => (
                                                <option key={b} value={b}>{t(b)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="target_value" value={t('Target')} />
                                        <TextInput
                                            id="target_value"
                                            type="number"
                                            min="1"
                                            value={data.target_value}
                                            onChange={(e) => setData('target_value', parseInt(e.target.value) || 1)}
                                            required
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.target_value} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="unit" value={t('Unit')} />
                                        <select
                                            id="unit"
                                            value={data.unit}
                                            onChange={(e) => setData('unit', e.target.value)}
                                            className="select select-bordered mt-1 w-full"
                                        >
                                            {UNIT_OPTIONS.map((u) => (
                                                <option key={u} value={u}>{t(u)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="metric_source" value={t('Measures')} />
                                    <select
                                        id="metric_source"
                                        value={data.metric_source}
                                        onChange={(e) => setData('metric_source', e.target.value)}
                                        className="select select-bordered mt-1 w-full"
                                    >
                                        {METRIC_OPTIONS.map((m) => (
                                            <option key={m} value={m}>{t(m)}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.metric_source} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="starts_on" value={t('Starts on')} />
                                        <TextInput
                                            id="starts_on"
                                            type="date"
                                            value={data.starts_on}
                                            onChange={(e) => setData('starts_on', e.target.value)}
                                            required
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.starts_on} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="ends_on" value={t('Ends on (optional)')} />
                                        <TextInput
                                            id="ends_on"
                                            type="date"
                                            value={data.ends_on}
                                            onChange={(e) => setData('ends_on', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.ends_on} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton type="button" onClick={closeForm}>
                                    {t('Cancel')}
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {t('Save')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Modal>
            </Container>
        </AuthenticatedLayout>
    );
}
