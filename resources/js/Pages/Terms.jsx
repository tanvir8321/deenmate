import { Head } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import LandingHeader from '@/Components/Landing/LandingHeader';
import LandingFooter from '@/Components/Landing/LandingFooter';
import { GeometricDivider } from '@/Components/Landing/Motifs';

export default function Terms() {
    const { t, isRtl } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col bg-base-100 text-base-content" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head title={t('Terms.TermsTitle')} />
            <LandingHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
                <h1 className="font-display text-4xl font-bold text-base-content">
                    {t('Terms.TermsTitle')}
                </h1>
                <p className="mt-2 text-sm text-base-content/60">
                    {t('Terms.TermsUpdated')}
                </p>

                <GeometricDivider className="my-8" />

                <div className="prose prose-stone max-w-none text-base-content/80">
                    <h2 className="font-display text-2xl font-semibold">{t('Terms.SectionServiceTitle')}</h2>
                    <p>{t('Terms.SectionServiceBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Terms.SectionAccountTitle')}</h2>
                    <p>{t('Terms.SectionAccountBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Terms.SectionDonationsTitle')}</h2>
                    <p>{t('Terms.SectionDonationsBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Terms.SectionLicenseTitle')}</h2>
                    <p>
                        {t('Terms.SectionLicenseBody')}{' '}
                        <a
                            href="https://www.gnu.org/licenses/agpl-3.0.html"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="link link-primary"
                        >
                            AGPL-3.0
                        </a>
                        .
                    </p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Terms.SectionNoWarrantyTitle')}</h2>
                    <p>{t('Terms.SectionNoWarrantyBody')}</p>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
