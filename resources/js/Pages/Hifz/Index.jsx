import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import useTranslation from '@/hooks/useTranslation';

const QUALITY_LABELS = [
    { value: 0, label: 'Again', color: 'btn-error' },
    { value: 1, label: 'Hard', color: 'btn-warning' },
    { value: 2, label: 'Good', color: 'btn-warning btn-outline' },
    { value: 3, label: 'Easy', color: 'btn-success' },
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
            learning: 'badge-info',
            review: 'badge-secondary',
        };
        return (
            <span className={`badge badge-sm ${colors[status] ?? 'badge-neutral'}`}>
                {t(status.charAt(0).toUpperCase() + status.slice(1))}
            </span>
        );
    };

    const ItemCard = ({ item }) => (
        <div
            className="card cursor-pointer border border-base-300 bg-base-100 transition hover:border-primary"
            onClick={() => openReviewModal(item)}
        >
            <div className="card-body flex-row items-center justify-between p-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-base-content">
                            {item.ref_start} - {item.ref_end}
                        </span>
                        {statusBadge(item.status)}
                    </div>
                    <p className="mt-1 text-sm text-base-content/60">
                        {t('Next review')}: {item.next_review_on}
                    </p>
                </div>
                <div className="text-end">
                    <span className="text-sm font-medium text-base-content/80">
                        {t('Ease')}: {(item.ease / 100).toFixed(1)}x
                    </span>
                </div>
            </div>
        </div>
    );

    const Section = ({ title, items }) => (
        <div className="space-y-3">
            <h3 className="text-lg font-medium text-base-content">{title}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-base-content/60">{t('No items')}</p>
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
                <h2 className="text-xl font-semibold leading-tight text-base-content">
                    {t('Hifz Tracker')}
                </h2>
            }
        >
            <Head title={t('Hifz Tracker')} />

            <Container className="space-y-4 py-2">
                    {dueItems.length > 0 && (
                        <div className="alert alert-success">
                            <div>
                                <h3 className="font-semibold">
                                    {t('Due Today')} ({dueItems.length})
                                </h3>
                                <div className="mt-2 space-y-2">
                                    {dueItems.map((item) => (
                                        <ItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card bg-base-100 shadow">
                        <div className="card-body p-4 sm:p-6">
                        <h3 className="text-lg font-medium text-base-content mb-4">
                            {t('Add Verse')}
                        </h3>
                        <form onSubmit={submitAdd} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                    className="select select-bordered mt-1 w-full"
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
                    </div>

                    <div className="card bg-base-100 shadow">
                        <div className="card-body p-4 sm:p-6">
                        <Section title={t('Learning')} items={learningItems} />
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow">
                        <div className="card-body p-4 sm:p-6">
                        <Section title={t('Review')} items={reviewItems} />
                        </div>
                    </div>
            </Container>

            {showModal && selectedItem && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-medium text-base-content">
                            {selectedItem.ref_start} - {selectedItem.ref_end}
                        </h3>
                        <p className="mt-1 text-sm text-base-content/70">
                            {t('How well did you remember?')}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {QUALITY_LABELS.map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => submitReview(value)}
                                    className={`btn ${color}`}
                                >
                                    {t(label)}
                                </button>
                            ))}
                        </div>
                        <div className="modal-action">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                {t('Cancel')}
                            </SecondaryButton>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-backdrop"
                        onClick={() => setShowModal(false)}
                        aria-label={t('Close menu')}
                    />
                </div>
            )}
        </AuthenticatedLayout>
    );
}