import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { Arabesque } from './Motifs';

export default function FinalCTA() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-base-100 py-20 sm:py-24">
            <Arabesque className="pointer-events-none absolute -top-12 -start-12 text-primary/10" size={240} />
            <Arabesque className="pointer-events-none absolute -bottom-12 -end-12 text-secondary/10" size={240} />

            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl font-bold text-base-content sm:text-5xl">
                    {t('Landing.FinalCTATitle')}
                </h2>
                <p className="mt-3 text-base text-base-content/70 sm:text-lg">
                    {t('Landing.FinalCTASub')}
                </p>
                <div className="mt-8">
                    <Link href={route('register')} className="btn btn-primary btn-lg">
                        {t('Landing.HeroCTAPrimary')}
                    </Link>
                </div>
                <p className="mt-5 text-xs text-base-content/60 sm:text-sm">
                    {t('Landing.HeroTrust')}
                </p>
            </div>
        </section>
    );
}
