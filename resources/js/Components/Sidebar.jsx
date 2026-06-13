import { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SidebarLink from '@/Components/SidebarLink';
import SidebarSection from '@/Components/SidebarSection';
import UserDropdown from '@/Components/UserDropdown';
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

export default function Sidebar() {
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
                <UserDropdown align="top" showName={!collapsed} containerClass={!collapsed ? 'w-full' : ''} />
            </div>
        </aside>
    );
}
