import useTranslation from '@/hooks/useTranslation';

export default function Testimonials() {
    const { t } = useTranslation();

    const items = [
        {
            nameKey: 'Landing.Testimonial1Name',
            countryKey: 'Landing.Testimonial1Country',
            quoteKey: 'Landing.Testimonial1Quote',
            avatarBg: 'bg-primary',
        },
        {
            nameKey: 'Landing.Testimonial2Name',
            countryKey: 'Landing.Testimonial2Country',
            quoteKey: 'Landing.Testimonial2Quote',
            avatarBg: 'bg-secondary',
        },
        {
            nameKey: 'Landing.Testimonial3Name',
            countryKey: 'Landing.Testimonial3Country',
            quoteKey: 'Landing.Testimonial3Quote',
            avatarBg: 'bg-accent',
        },
    ];

    return (
        <section className="bg-base-100 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-3 max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-bold text-base-content sm:text-4xl">
                        {t('Landing.TestimonialsTitle')}
                    </h2>
                </div>
                <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-base-content/60">
                    {t('Landing.TestimonialsNote')}
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {items.map((it, idx) => (
                        <figure
                            key={idx}
                            className="card border border-base-300 bg-base-200 shadow-sm"
                        >
                            <div className="card-body">
                                <svg
                                    className="h-8 w-8 text-primary/30"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M14.017 21v-7.391c0-5.704 3.748-9.57 9-10.609l.583 2.751c-2.517.846-4.244 2.708-4.583 5.249h4v10h-9zM5.017 21v-7.391c0-5.704 3.748-9.57 9-10.609l.583 2.751c-2.517.846-4.244 2.708-4.583 5.249h4v10h-9z" />
                                </svg>
                                <blockquote className="text-sm leading-relaxed text-base-content/80">
                                    "{t(it.quoteKey)}"
                                </blockquote>
                                <figcaption className="mt-3 flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold text-white ${it.avatarBg}`}>
                                        {t(it.nameKey).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-base-content">{t(it.nameKey)}</p>
                                        <p className="text-xs text-base-content/60">{t(it.countryKey)}</p>
                                    </div>
                                </figcaption>
                            </div>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
