import useTranslation from '@/hooks/useTranslation';
import { GeometricDivider } from './Motifs';

function ValueIcon({ kind }) {
    const base = 'h-7 w-7';
    if (kind === 'free') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={base}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
        );
    }
    if (kind === 'open') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={base}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={base}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
    );
}

export default function ValueProps() {
    const { t } = useTranslation();

    const items = [
        {
            key: 'free',
            titleKey: 'Landing.ValueFree',
            bodyKey: 'Landing.ValueFreeBody',
            cta: null,
        },
        {
            key: 'open',
            titleKey: 'Landing.ValueOpen',
            bodyKey: 'Landing.ValueOpenBody',
            cta: {
                label: t('Landing.ValueOpenLink'),
                href: 'https://github.com/tanvir8321/deenmate',
            },
        },
        {
            key: 'private',
            titleKey: 'Landing.ValuePrivate',
            bodyKey: 'Landing.ValuePrivateBody',
            cta: null,
        },
    ];

    return (
        <section className="bg-base-200 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <GeometricDivider className="mb-12" />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {items.map((it) => (
                        <div
                            key={it.key}
                            className="card border border-base-300 bg-base-100 shadow-sm transition hover:shadow-md"
                        >
                            <div className="card-body items-start">
                                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ValueIcon kind={it.key} />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-base-content">
                                    {t(it.titleKey)}
                                </h3>
                                <p className="text-sm text-base-content/70">{t(it.bodyKey)}</p>
                                {it.cta && (
                                    <a
                                        href={it.cta.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="link link-primary mt-2 text-sm"
                                    >
                                        {it.cta.label} →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
