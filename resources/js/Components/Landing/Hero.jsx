import { Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { Arabesque, ArchFrame } from './Motifs';

const HERO_IMG =
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80&auto=format&fit=crop';

export default function Hero() {
    const { t, isRtl } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/10 via-base-100 to-base-100">
            <Arabesque
                className="pointer-events-none absolute -top-12 -end-16 text-primary/15 lg:hidden"
                size={220}
            />
            <Arabesque
                className="pointer-events-none absolute -top-20 -end-24 hidden text-primary/10 lg:block"
                size={360}
            />

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
                <div className={`relative z-10 ${isRtl ? 'lg:order-2' : ''}`}>
                    <span className="badge badge-outline badge-primary gap-1 px-3 py-3 text-xs sm:text-sm">
                        {t('Landing.EyebrowTrust')}
                    </span>
                    <h1 className="font-display mt-4 text-4xl font-bold leading-tight text-base-content sm:text-5xl lg:text-6xl">
                        {t('Landing.HeroH1')}
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-base-content/75 sm:text-lg">
                        {t('Landing.HeroSub')}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Link href={route('register')} className="btn btn-primary btn-lg">
                            {t('Landing.HeroCTAPrimary')}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4 rtl:rotate-180"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                        <a href="#how-it-works" className="btn btn-ghost btn-lg">
                            {t('Landing.HeroCTASecondary')}
                        </a>
                    </div>
                    <p className="mt-5 text-xs text-base-content/60 sm:text-sm">
                        {t('Landing.HeroTrust')}
                    </p>
                </div>

                <div className={`relative ${isRtl ? 'lg:order-1' : ''}`}>
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
                        <ArchFrame className="absolute inset-0 text-primary/30">
                            <img
                                src={HERO_IMG}
                                alt=""
                                width={800}
                                height={1000}
                                loading="eager"
                                fetchPriority="high"
                                className="h-full w-full object-cover"
                            />
                        </ArchFrame>
                        <Arabesque
                            className="absolute -bottom-6 -start-6 text-accent/50"
                            size={120}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
