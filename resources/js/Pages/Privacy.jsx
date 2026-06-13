import { Head } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import LandingHeader from '@/Components/Landing/LandingHeader';
import LandingFooter from '@/Components/Landing/LandingFooter';
import { GeometricDivider } from '@/Components/Landing/Motifs';

export default function Privacy() {
    const { t, isRtl } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col bg-base-100 text-base-content" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head title={t('Privacy.PrivacyTitle')} />
            <LandingHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
                <h1 className="font-display text-4xl font-bold text-base-content">
                    {t('Privacy.PrivacyTitle')}
                </h1>
                <p className="mt-2 text-sm text-base-content/60">
                    {t('Privacy.PrivacyUpdated')}
                </p>

                <GeometricDivider className="my-8" />

                <div className="prose prose-stone max-w-none text-base-content/80">
                    <h2 className="font-display text-2xl font-semibold">{t('Privacy.SectionPledgeTitle')}</h2>
                    <p>{t('Privacy.SectionPledgeBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Privacy.SectionDataTitle')}</h2>
                    <p>{t('Privacy.SectionDataBody')}</p>
                    <ul>
                        <li>{t('Privacy.SectionDataItem1')}</li>
                        <li>{t('Privacy.SectionDataItem2')}</li>
                        <li>{t('Privacy.SectionDataItem3')}</li>
                    </ul>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Privacy.SectionAnalyticsTitle')}</h2>
                    <p>{t('Privacy.SectionAnalyticsBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Privacy.SectionRightsTitle')}</h2>
                    <p>{t('Privacy.SectionRightsBody')}</p>

                    <h2 className="font-display mt-8 text-2xl font-semibold">{t('Privacy.SectionContactTitle')}</h2>
                    <p>
                        {t('Privacy.SectionContactBody')}{' '}
                        <a href="mailto:hello@deenmate.app" className="link link-primary">hello@deenmate.app</a>
                    </p>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
