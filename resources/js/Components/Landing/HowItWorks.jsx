import useTranslation from '@/hooks/useTranslation';
import { GeometricDivider } from './Motifs';

function StepNumber({ n }) {
    return (
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full text-primary" aria-hidden="true">
                <path
                    d="M32 2 L40 14 L54 16 L46 28 L48 42 L32 38 L16 42 L18 28 L10 16 L24 14 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </svg>
            <span className="font-display relative text-2xl font-bold text-primary">{n}</span>
        </div>
    );
}

export default function HowItWorks() {
    const { t } = useTranslation();

    const steps = [
        { n: 1, titleKey: 'Landing.Step1Title', bodyKey: 'Landing.Step1Body' },
        { n: 2, titleKey: 'Landing.Step2Title', bodyKey: 'Landing.Step2Body' },
        { n: 3, titleKey: 'Landing.Step3Title', bodyKey: 'Landing.Step3Body' },
    ];

    return (
        <section id="how-it-works" className="bg-base-100 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-bold text-base-content sm:text-4xl">
                        {t('Landing.HowItWorksTitle')}
                    </h2>
                    <p className="mt-3 text-base text-base-content/70">
                        {t('Landing.HowItWorksSub')}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {steps.map((s) => (
                        <div key={s.n} className="text-center">
                            <StepNumber n={s.n} />
                            <h3 className="font-display text-xl font-semibold text-base-content">
                                {t(s.titleKey)}
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-base-content/70">
                                {t(s.bodyKey)}
                            </p>
                        </div>
                    ))}
                </div>

                <GeometricDivider className="mt-12" />
            </div>
        </section>
    );
}
