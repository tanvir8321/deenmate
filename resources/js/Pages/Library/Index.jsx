import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
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
                <h2 className="text-xl font-semibold text-base-content">
                    {t('Routine Library')}
                </h2>
            }
        >
            <Head title={t('Routine Library')} />

            <Container className="space-y-4 py-2">
                    {templates.length === 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body p-8 text-center text-base-content/60">
                                {t('No templates available yet.')}
                            </div>
                        </div>
                    )}

                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-base-content/60">
                                {t(CATEGORY_LABELS[category] ?? category)}
                            </h3>
                            <div className="space-y-3">
                                {items.map((template) => (
                                    <div
                                        key={template.id}
                                        className="card bg-base-100 shadow"
                                    >
                                        <div className="card-body flex-row items-center justify-between p-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate font-medium text-base-content">
                                                        {template.title}
                                                    </p>
                                                    {template.verified && (
                                                        <span className="badge badge-success badge-sm">
                                                            {t('Verified')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-base-content/60">{template.description}</p>
                                                <p className="mt-1 text-xs text-base-content/50">
                                                    {template.install_count > 0
                                                        ? t(':count installs', { count: template.install_count })
                                                        : t('Not yet installed')}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => install(template)}
                                                className="btn btn-primary btn-sm ms-3 shrink-0"
                                            >
                                                {t('Install')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </Container>
        </AuthenticatedLayout>
    );
}
