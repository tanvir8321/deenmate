import useTranslation from '@/hooks/useTranslation';
import { GeometricDivider } from './Motifs';

export default function Mission() {
    const { t, locale } = useTranslation();
    const showArabicFont = locale === 'ar' || locale === 'ur';

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-base-200 to-secondary/8 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-display text-3xl font-bold text-base-content sm:text-4xl">
                        {t('Landing.MissionTitle')}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-base-content/80 sm:text-lg">
                        {t('Landing.MissionBody')}
                    </p>
                </div>

                <div className="mt-10 rounded-box border border-primary/20 bg-base-100 p-8 shadow-sm">
                    <div className={`mb-3 text-center text-2xl leading-loose text-primary ${showArabicFont ? 'font-quran' : 'font-quran'}`}>
                        {t('Landing.MissionHadithArabic')}
                    </div>
                    <p className="text-center text-base italic text-base-content/80">
                        {t('Landing.MissionHadithTranslation')}
                    </p>
                    <p className="mt-3 text-center text-xs text-base-content/60">
                        — {t('Landing.MissionHadithSource')}
                    </p>
                </div>

                <GeometricDivider className="mt-12" />
            </div>
        </section>
    );
}
