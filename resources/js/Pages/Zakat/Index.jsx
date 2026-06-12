import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Zakat Calculator')}
                </h2>
            }
        >
            <Head title={t('Zakat Calculator')} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
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
                        <div className="mt-6 bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Zakat Calculation Result')}
                            </h3>

                            <dl className="mt-4 space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">{t('Total Assets')}</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        ${result.total_assets.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">{t('Liabilities')}</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        -${result.liabilities.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">{t('Net Assets')}</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        ${result.net_assets.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">
                                        {t('Nisab Threshold')}
                                        {result.nisab_source === 'fixed' && (
                                            <span className="ml-1 text-xs text-gray-400">(fixed estimate)</span>
                                        )}
                                    </dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        ${result.nisab_threshold.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">{t('Assets Above Nisab')}</dt>
                                    <dd className="font-medium text-gray-900 dark:text-gray-100">
                                        ${result.assets_above_nisab.toLocaleString()}
                                    </dd>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between bg-emerald-50 dark:bg-emerald-900/20 -mx-4 px-4 py-2 rounded">
                                    <dt className="font-semibold text-emerald-700 dark:text-emerald-300">{t('Zakat Owed (2.5%)')}</dt>
                                    <dd className="font-bold text-emerald-700 dark:text-emerald-300">
                                        ${result.zakat_owed.toLocaleString()}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    {t('This is an estimate. Please consult a qualified Islamic scholar for precise calculation.')}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {t('Zakat Anniversary Reminder')}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('Set a yearly reminder for your Zakat anniversary on your profile settings.')}
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}