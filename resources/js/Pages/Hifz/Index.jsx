import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

const QUALITY_LABELS = [
    { value: 0, label: 'Again', color: 'bg-red-500 hover:bg-red-600' },
    { value: 1, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 2, label: 'Good', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 3, label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
];

export default function Index({ dueItems, learningItems, reviewItems }) {
    const { t } = useTranslation();
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const addForm = useForm({
        ref_start: '',
        ref_end: '',
        status: 'learning',
    });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('hifz.store'), {
            onSuccess: () => {
                addForm.reset();
            },
        });
    };

    const openReviewModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const submitReview = (quality) => {
        addForm.post(route('hifz.review'), {
            hifz_item_id: selectedItem.id,
            quality,
            onSuccess: () => {
                setShowModal(false);
                setSelectedItem(null);
            },
        });
    };

    const statusBadge = (status) => {
        const colors = {
            learning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        };
        return (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
                {t(status.charAt(0).toUpperCase() + status.slice(1))}
            </span>
        );
    };

    const ItemCard = ({ item }) => (
        <div
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-500 dark:border-gray-700 dark:bg-gray-800"
            onClick={() => openReviewModal(item)}
        >
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.ref_start} - {item.ref_end}
                    </span>
                    {statusBadge(item.status)}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('Next review')}: {item.next_review_on}
                </p>
            </div>
            <div className="text-right">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('Ease')}: {(item.ease / 100).toFixed(1)}x
                </span>
            </div>
        </div>
    );

    const Section = ({ title, items }) => (
        <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('No items')}</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Hifz Tracker')}
                </h2>
            }
        >
            <Head title={t('Hifz Tracker')} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8 space-y-6">
                    {dueItems.length > 0 && (
                        <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                            <h3 className="font-medium text-emerald-700 dark:text-emerald-300">
                                {t('Due Today')} ({dueItems.length})
                            </h3>
                            <div className="mt-3 space-y-2">
                                {dueItems.map((item) => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            {t('Add Verse')}
                        </h3>
                        <form onSubmit={submitAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="ref_start" value={t('Reference Start')} />
                                    <TextInput
                                        id="ref_start"
                                        className="mt-1 block w-full"
                                        value={addForm.data.ref_start}
                                        onChange={(e) => addForm.setData('ref_start', e.target.value)}
                                        placeholder="e.g., Al-Baqarah:255"
                                    />
                                    <InputError className="mt-2" message={addForm.errors.ref_start} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ref_end" value={t('Reference End')} />
                                    <TextInput
                                        id="ref_end"
                                        className="mt-1 block w-full"
                                        value={addForm.data.ref_end}
                                        onChange={(e) => addForm.setData('ref_end', e.target.value)}
                                        placeholder="e.g., Al-Baqarah:255"
                                    />
                                    <InputError className="mt-2" message={addForm.errors.ref_end} />
                                </div>
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value={t('Status')} />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                                    value={addForm.data.status}
                                    onChange={(e) => addForm.setData('status', e.target.value)}
                                >
                                    <option value="learning">{t('Learning')}</option>
                                    <option value="review">{t('Review')}</option>
                                </select>
                                <InputError className="mt-2" message={addForm.errors.status} />
                            </div>
                            <PrimaryButton type="submit" disabled={addForm.processing}>
                                {t('Add')}
                            </PrimaryButton>
                        </form>
                    </div>

                    <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                        <Section title={t('Learning')} items={learningItems} />
                    </div>

                    <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                        <Section title={t('Review')} items={reviewItems} />
                    </div>
                </div>
            </div>

            {showModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {selectedItem.ref_start} - {selectedItem.ref_end}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('How well did you remember?')}
                        </p>
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {QUALITY_LABELS.map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => submitReview(value)}
                                    className={`rounded-md px-3 py-2 text-sm font-medium text-white ${color} transition`}
                                >
                                    {t(label)}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                {t('Cancel')}
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}