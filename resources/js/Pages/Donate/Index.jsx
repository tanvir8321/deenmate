import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

const donationPlatforms = [
    {
        name: 'GitHub Sponsors',
        url: 'https://github.com/sponsors/deenmate',
        description: 'Recurring or one-time donations via GitHub',
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
        ),
    },
    {
        name: 'Open Collective',
        url: 'https://opencollective.com/deenmate',
description: 'Transparent, open-source funding platform',
        icon: <span className="text-2xl">🐙</span>,
    },
    {
        name: 'Stripe',
        url: 'https://buy.stripe.com/deenmate',
        description: 'Secure card payments via Stripe',
        icon: <span className="text-2xl">💳</span>,
    },
];

const fundingAreas = [
    {
        title: 'Hosting & Infrastructure',
        description: 'Servers, databases, and CDN to keep DeenMate fast and reliable.',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
        ),
    },
    {
        title: 'Development',
        description: 'Building new features, fixing bugs, and maintaining the codebase.',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        ),
    },
    {
        title: 'Content & Translations',
        description: 'Religious content curation, translations, and accessibility improvements.',
        icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
    },
];

export default function Index() {
    return (
        <GuestLayout>
            <Head title="Donate" />

            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-5xl">
                        Support DeenMate
                    </h1>
                    <p className="mt-4 text-xl text-primary font-medium">
                        Sadaqah Jariyah &mdash; ongoing charity that benefits you even after death
                    </p>
                    <p className="mt-6 text-lg text-base-content/70 max-w-2xl mx-auto">
                        DeenMate is a free, open-source app. Every donation helps
                        keep the servers running and development moving forward.
                        May Allah accept your contribution.
                    </p>
                </div>

                <div className="mb-16 rounded-2xl bg-success/10/20 border border-success/30 p-6 text-center">
                    <p className="text-lg font-semibold text-primary">
                        All features are free, forever.
                    </p>
                    <p className="mt-2 text-primary">
                        No paywalls, no premium tiers, no ads. Your donation is
                        purely for support &mdash; it unlocks nothing because
                        everything is already unlocked.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-base-content mb-8 text-center">
                        What donations fund
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-3">
                        {fundingAreas.map((area) => (
                            <div
                                key={area.title}
                                className="rounded-xl bg-base-100 border border-base-300 p-6 shadow-sm"
                            >
                                <div className="mb-3 text-primary">
                                    {area.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-base-content">
                                    {area.title}
                                </h3>
                                <p className="mt-2 text-sm text-base-content/70">
                                    {area.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-base-content mb-8 text-center">
                        Choose a platform
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-3">
                        {donationPlatforms.map((platform) => (
                            <a
                                key={platform.name}
                                href={platform.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center rounded-xl bg-base-100 border border-base-300 p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
                            >
                                <div className="mb-4 text-base-content/80 group-hover:text-primary transition-colors">
                                    {platform.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-base-content">
                                    {platform.name}
                                </h3>
                                <p className="mt-2 text-sm text-base-content/70 text-center">
                                    {platform.description}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl bg-warning/10/20 border border-warning/30 p-6 mb-16">
                    <h2 className="text-xl font-bold text-amber-900 mb-3">
                        For Bangladesh donors
                    </h2>
                    <p className="text-warning mb-4">
                        You can also donate via bKash or Nagad:
                    </p>
                    <div className="space-y-2 text-warning">
                        <p>
                            <span className="font-semibold">bKash:</span>{' '}
                            +880 1XXX-XXXXXX (Personal)
                        </p>
                        <p>
                            <span className="font-semibold">Nagad:</span>{' '}
                            +880 1XXX-XXXXXX (Personal)
                        </p>
                    </div>
                    <p className="mt-4 text-sm text-warning">
                        After sending, please email us so we can record your
                        donation and send a thank-you.
                    </p>
                </div>

                <footer className="text-center text-sm text-base-content/60 space-y-1">
                    <p>May Allah reward you abundantly for your support.</p>
                    <p>DeenMate &middot; Free &amp; Open Source &middot; AGPL-3.0</p>
                </footer>
            </div>
        </GuestLayout>
    );
}
