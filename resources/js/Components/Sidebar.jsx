import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SidebarLink from '@/Components/SidebarLink';
import SidebarSection from '@/Components/SidebarSection';
import useTranslation from '@/hooks/useTranslation';

const NAV = [
    { section: null, items: [
        { route: 'dashboard', label: 'Today', icon: 'dashboard' },
    ]},
    { section: 'Worship', items: [
        { route: 'salah.index',   label: 'Salah',   icon: 'salah'   },
        { route: 'adhkar.index',  label: 'Adhkar',  icon: 'adhkar'  },
        { route: 'quran.index',   label: 'Quran',   icon: 'quran'   },
        { route: 'hifz.index',    label: 'Hifz',    icon: 'hifz'    },
        { route: 'tasbih.index',  label: 'Tasbih',  icon: 'tasbih'  },
        { route: 'library.index', label: 'Library', icon: 'library' },
    ]},
    { section: 'Life', items: [
        { route: 'routines.index', label: 'Routines', icon: 'routines' },
        { route: 'todos.index',    label: 'Todos',    icon: 'todos'    },
        { route: 'fasting.index',  label: 'Fasting',  icon: 'fasting'  },
        { route: 'zakat.index',    label: 'Zakat',    icon: 'zakat'    },
    ]},
    { section: 'Insights', items: [
        { route: 'goals.index',   label: 'Goals',   icon: 'goals'   },
        { route: 'reports.index', label: 'Reports', icon: 'reports' },
        { route: 'circles.index', label: 'Circles', icon: 'circles' },
    ]},
    { section: null, items: [
        { route: 'donate', label: 'Donate', icon: 'donate', accent: true },
    ]},
];

function isActive(currentName, target) {
    if (currentName === target) return true;
    const base = target.replace('.index', '');
    return currentName === base || currentName?.startsWith(`${base}.`);
}

function ChevronUpIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 opacity-60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
    );
}

export default function Sidebar() {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();
    const current = route().current();
    const [collapsed, setCollapsed] = useState(false);

    const available = NAV
        .map((s) => ({ ...s, items: s.items.filter((i) => route().has(i.route)) }))
        .filter((s) => s.items.length > 0);

    const widthClass = collapsed ? 'w-16' : 'w-64';

    return (
        <aside
            className={`hidden h-screen shrink-0 flex-col border-e border-base-300 bg-base-100 transition-all duration-200 lg:flex ${widthClass}`}
            aria-label="Primary"
        >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-base-300 px-3">
                <Link
                    href={route('dashboard')}
                    className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}
                >
                    <ApplicationLogo className="h-8 w-8 fill-primary" />
                    {!collapsed && <span className="text-base font-bold text-base-content">DeenMate</span>}
                </Link>
                <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="btn btn-ghost btn-xs"
                    aria-label={collapsed ? t('Sidebar expand') : t('Sidebar collapse')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5" />
                    </svg>
                </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto py-3">
                {available.map((s, idx) => (
                    <SidebarSection key={s.section ?? `top-${idx}`} title={s.section ? t(s.section) : null}>
                        {s.items.map((item) => (
                            <SidebarLink
                                key={item.route}
                                routeName={item.route}
                                label={t(item.label)}
                                icon={item.icon}
                                active={isActive(current, item.route)}
                                accent={item.accent}
                                collapsed={collapsed}
                            />
                        ))}
                    </SidebarSection>
                ))}
            </nav>

            <div className="shrink-0 border-t border-base-300 p-2">
                <div className="dropdown dropdown-top w-full">
                    <label
                        tabIndex={0}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 transition hover:bg-base-200 ${
                            collapsed ? 'justify-center' : ''
                        }`}
                        aria-label={t('Account menu')}
                    >
                        <div className="avatar placeholder shrink-0">
                            <div className="w-8 rounded-full bg-primary text-primary-content">
                                <span className="text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                            </div>
                        </div>
                        {!collapsed && (
                            <>
                                <div className="min-w-0 flex-1 text-start">
                                    <p className="truncate text-xs font-semibold text-base-content">{user.name}</p>
                                    <p className="truncate text-xs text-base-content/60">{user.email}</p>
                                </div>
                                <ChevronUpIcon />
                            </>
                        )}
                    </label>
                    {!collapsed && (
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu menu-sm w-56 rounded-box bg-base-100 p-2 shadow-lg ring-1 ring-base-300"
                        >
                            <li>
                                <Link href={route('profile.edit')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {t('Profile')}
                                </Link>
                            </li>
                            <li>
                                <Link href={route('settings.edit')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {t('Settings')}
                                </Link>
                            </li>
                            <li>
                                <Link href={route('logout')} method="post" as="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    {t('Log Out')}
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </aside>
    );
}
