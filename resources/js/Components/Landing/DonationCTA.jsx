import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

export default function DonationCTA() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary py-12 sm:py-16">
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <pattern id="donationPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M20 0 L25 15 L40 20 L25 25 L20 40 L15 25 L0 20 L15 15 Z" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#donationPattern)" />
                </svg>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl font-bold text-primary-content sm:text-4xl">
                    {t('Landing.DonationTitle')}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-base text-primary-content/90 sm:text-lg">
                    {t('Landing.DonationBody')}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Link href={route('donate')} className="btn btn-warning btn-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {t('Landing.DonationCTA')}
                    </Link>
                    <a
                        href="https://github.com/tanvir8321/deenmate/blob/main/CONTRIBUTING.md"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
                    >
                        {t('Landing.DonationSecondary')}
                    </a>
                </div>
            </div>
        </section>
    );
}
