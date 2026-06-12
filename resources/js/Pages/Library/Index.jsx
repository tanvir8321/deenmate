import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

const CATEGORY_LABELS = {
    salah: 'Salah',
    adhkar: 'Adhkar',
    quran: 'Quran',
    fasting: 'Fasting',
    general: 'General',
};

export default function Index({ templates }) {
    const { t } = useTranslation();

    const grouped = templates.reduce((acc, template) => {
        const cat = template.category ?? 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(template);
        return acc;
    }, {});

    const install = (template) => {
        if (confirm(t('Install this routine pack? New routines will be created.'))) {
            router.post(route('library.install', template.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('Routine Library')}
                </h2>
            }
        >
            <Head title={t('Routine Library')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {templates.length === 0 && (
                        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                            {t('No templates available yet.')}
                        </div>
                    )}

                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                {t(CATEGORY_LABELS[category] ?? category)}
                            </h3>
                            <div className="space-y-3">
                                {items.map((template) => (
                                    <div
                                        key={template.id}
                                        className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate font-medium text-gray-900">
                                                    {template.title}
                                                </p>
                                                {template.verified && (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                        {t('Verified')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {template.install_count > 0
                                                    ? t(':count installs', { count: template.install_count })
                                                    : t('Not yet installed')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => install(template)}
                                            className="ml-3 shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                        >
                                            {t('Install')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
