import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from '@/Components/Sidebar';
import MobileDrawer from '@/Components/MobileDrawer';
import useTranslation from '@/hooks/useTranslation';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { t, isRtl } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-base-200" dir={isRtl ? 'rtl' : 'ltr'}>
            <Sidebar />
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="navbar shrink-0 border-b border-base-300 bg-base-100/80 backdrop-blur lg:hidden">
                    <div className="flex-1">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            className="btn btn-ghost btn-square btn-sm"
                            aria-label={t('Open menu')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <Link href={route('dashboard')} className="ms-2 flex items-center gap-2">
                            <ApplicationLogo className="h-7 w-7 fill-primary" />
                            <span className="text-base font-bold">DeenMate</span>
                        </Link>
                    </div>
                    <div className="flex-none">
                        <Link
                            href={route('profile.edit')}
                            className="btn btn-ghost btn-sm"
                            aria-label={t('Profile')}
                        >
                            <div className="avatar placeholder">
                                <div className="w-7 rounded-full bg-primary text-primary-content">
                                    <span className="text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {header && (
                    <header className="hidden shrink-0 border-b border-base-300 bg-base-100 lg:block">
                        <div className="px-4 py-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
