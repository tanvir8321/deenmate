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
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {t('Goals')}
                    </h2>
                    <PrimaryButton onClick={openCreate}>{t('New goal')}</PrimaryButton>
                </div>
            }
        >
            <Head title={t('Goals')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {goals.length > 0 && (
                        <div className="flex gap-2">
                            {['all', 'daily', 'monthly', 'yearly'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPeriodFilter(p)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        periodFilter === p
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {p === 'all' ? t('All') : t(p)}
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredGoals.length === 0 && (
                        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                            {t('No goals yet. Set a target to track your progress.')}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredGoals.map((goal) => (
                            <div
                                key={goal.id}
                                className="rounded-lg bg-white p-4 shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-900">{goal.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {t(goal.period)} · {t(goal.metric_source)}
                                            {goal.period_basis === 'hijri' && ` (${t('Hijri')})`}
                                        </p>
                                    </div>
                                    <div className="ml-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(goal)}
                                            className="text-xs font-medium text-emerald-600 hover:underline"
                                        >
                                            {t('Edit')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => destroy(goal)}
                                            className="text-xs text-rose-500 hover:underline"
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
                        ))}
                    </div>

                    <Modal show={showForm} onClose={closeForm}>
                        <form onSubmit={submit} className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
