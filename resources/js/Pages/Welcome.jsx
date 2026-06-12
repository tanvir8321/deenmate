import { Head, Link } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

const features = [
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
        titleKey: 'Daily Checklist',
        descKey: 'Daily Checklist Desc',
    },
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
        titleKey: 'Prayer Times',
        descKey: 'Prayer Times Desc',
    },
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
        ),
        titleKey: 'Quran Tracking',
        descKey: 'Quran Tracking Desc',
    },
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
        ),
        titleKey: 'Fasting Log',
        descKey: 'Fasting Log Desc',
    },
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
        ),
        titleKey: 'Goals & Progress',
        descKey: 'Goals & Progress Desc',
    },
    {
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
        ),
        titleKey: 'Circles',
        descKey: 'Circles Desc',
    },
];

function FeatureCard({ icon, titleKey, descKey, t }) {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-emerald-900/30 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    {icon}
                </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t(titleKey)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t(descKey)}
            </p>
        </div>
    );
}

export default function Welcome({ auth }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="DeenMate" />

            <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-950 dark:text-white">
                {/* Nav */}
                <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700 dark:text-emerald-500">
                            <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 6v8l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            DeenMate
                        </Link>

                        <nav className="flex items-center gap-2 sm:gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    {t('Dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                    >
                                        {t('Log in')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        {t('Get Started Free')}
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-950" />
                    <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                            {t('DeenMate — Your Virtual Muslim Self')}
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-400">
                            {t('Your free companion for daily worship — checklist, prayer times, Quran, fasting, and more.')}
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl"
                            >
                                {t('Get Started Free')}
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a
                                href="https://github.com/tanvir8321/deenmate"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-zinc-700 dark:text-gray-300 dark:hover:border-zinc-600 dark:hover:text-white"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                {t('Contribute')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                {t('Everything you need for your daily worship')}
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                                {t('One app for all your Islamic routines. Free, private, and open source.')}
                            </p>
                        </div>
                        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((f) => (
                                <FeatureCard key={f.titleKey} {...f} t={t} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Privacy Pledge */}
                <section className="py-16 sm:py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                            <svg className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            <blockquote className="mt-6 text-xl font-semibold text-emerald-900 sm:text-2xl dark:text-emerald-300">
                                {t('No ads, no trackers, no data selling. Open source. AGPL-3.0.')}
                            </blockquote>
                            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400/80">
                                {t('Your worship data stays yours. We do not and will never track, share, or sell anything.')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Screenshots */}
                <section className="py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                {t('Screenshots')}
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                {t('Screenshots coming soon.')}
                            </p>
                        </div>
                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-600"
                                >
                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                            {t('Ready to start your journey?')}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
                            {t('Free forever. No credit card required. Join thousands of Muslims.')}
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={route('register')}
                                className="rounded-xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                            >
                                {t('Use Hosted Free')}
                            </Link>
                            <a
                                href="https://github.com/tanvir8321/deenmate/blob/main/SELF_HOSTING.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl border border-gray-300 px-8 py-4 text-base font-medium text-gray-700 transition hover:border-gray-400 dark:border-zinc-700 dark:text-gray-300 dark:hover:border-zinc-600"
                            >
                                {t('Self-Host')}
                            </a>
                            <Link
                                href={route('donate')}
                                className="rounded-xl border border-amber-300 bg-amber-50 px-8 py-4 text-base font-medium text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40"
                            >
                                {t('Donate')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 py-12 dark:border-zinc-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {t('Free & Open Source. Licensed under AGPL-3.0.')}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <a
                                    href="https://github.com/tanvir8321/deenmate"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    GitHub
                                </a>
                                <a
                                    href="https://github.com/tanvir8321/deenmate/blob/main/CONTRIBUTING.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {t('Contribute')}
                                </a>
                                <Link
                                    href={route('login')}
                                    className="transition hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {t('Log in')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
