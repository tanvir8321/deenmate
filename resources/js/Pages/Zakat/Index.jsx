import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import useTranslation from '@/hooks/useTranslation';

export default function Index({ result }) {
    const { t } = useTranslation();
    const { data, setData, post, errors, processing } = useForm({
        gold_value: '',
        silver_value: '',
        cash: '',
        liabilities: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('zakat.calculate'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-base-content">
                    {t('Zakat Calculator')}
                </h2>
            }
        >
            <Head title={t('Zakat Calculator')} />

            <Container className="py-2">
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-4 sm:p-5 lg:p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="gold_value" value={t('Gold Value (USD)')} />
                                <TextInput
                                    id="gold_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.gold_value}
                                    onChange={(e) => setData('gold_value', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.gold_value} />
                            </div>

                            <div>
                                <InputLabel htmlFor="silver_value" value={t('Silver Value (USD)')} />
                                <TextInput
                                    id="silver_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.silver_value}
                                    onChange={(e) => setData('silver_value', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.silver_value} />
                            </div>

                            <div>
                                <InputLabel htmlFor="cash" value={t('Cash & Savings (USD)')} />
                                <TextInput
                                    id="cash"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.cash}
                                    onChange={(e) => setData('cash', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.cash} />
                            </div>

                            <div>
                                <InputLabel htmlFor="liabilities" value={t('Liabilities/Debts (USD)')} />
                                <TextInput
                                    id="liabilities"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.liabilities}
                                    onChange={(e) => setData('liabilities', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.liabilities} />
                            </div>

                            <PrimaryButton type="submit" disabled={processing}>
                                {t('Calculate Zakat')}
                            </PrimaryButton>
                        </form>
                    </div>

                    {result && (
                        <div className="mt-6 bg-base-100 p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-medium text-base-content">
                                {t('Zakat Calculation Result')}
                            </h3>

                            <dl className="mt-4 space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-base-content/60">{t('Total Assets')}</dt>
                                    <dd className="font-medium text-base-content">
                                        ${result.total_assets.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-base-content/60">{t('Liabilities')}</dt>
                                    <dd className="font-medium text-base-content">
                                        -${result.liabilities.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="border-t border-base-300 pt-3 flex justify-between">
                                    <dt className="text-base-content/60">{t('Net Assets')}</dt>
                                    <dd className="font-medium text-base-content">
                                        ${result.net_assets.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-base-content/60">
                                        {t('Nisab Threshold')}
                                        {result.nisab_source === 'fixed' && (
                                            <span className="ml-1 text-xs text-base-content/50">(fixed estimate)</span>
                                        )}
                                    </dt>
                                    <dd className="font-medium text-base-content">
                                        ${result.nisab_threshold.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-base-content/60">{t('Assets Above Nisab')}</dt>
                                    <dd className="font-medium text-base-content">
                                        ${result.assets_above_nisab.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="border-t border-base-300 pt-3 flex justify-between bg-success/10/20 -mx-4 px-4 py-2 rounded">
                                    <dt className="font-semibold text-primary">{t('Zakat Owed (2.5%)')}</dt>
                                    <dd className="font-bold text-primary">
                                        ${result.zakat_owed.toLocaleString()}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4/20">
                                <p className="text-sm text-warning">
                                    {t('This is an estimate. Please consult a qualified Islamic scholar for precise calculation.')}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-base-100 p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-base-content">
                            {t('Zakat Anniversary Reminder')}
                        </h3>
                        <p className="mt-2 text-sm text-base-content/60">
                            {t('Set a yearly reminder for your Zakat anniversary on your profile settings.')}
                        </p>
                    </div>
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}