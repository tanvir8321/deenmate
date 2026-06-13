import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { CrescentStar } from './Motifs';

export default function LandingHeader() {
    const { t } = useTranslation();
    const user = usePage().props.auth?.user;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-40 transition-colors ${
                scrolled ? 'border-b border-base-300 bg-base-100/90 backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <CrescentStar className="text-primary" size={32} />
                    <span className="font-display text-xl font-bold text-base-content">DeenMate</span>
                </Link>
                <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
                    {user ? (
                        <Link href={route('dashboard')} className="btn btn-primary btn-sm sm:btn-md">
                            {t('Dashboard')}
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="btn btn-ghost btn-sm hidden sm:inline-flex"
                            >
                                {t('Log in')}
                            </Link>
                            <Link
                                href={route('register')}
                                className="btn btn-primary btn-sm sm:btn-md"
                            >
                                {t('Get Started Free')}
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
