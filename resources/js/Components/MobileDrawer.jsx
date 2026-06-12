import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef } from 'react';
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

export default function MobileDrawer({ open, onClose }) {
    const { t } = useTranslation();
    const current = route().current();
    const prevRoute = useRef(current);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (prevRoute.current !== current) {
            prevRoute.current = current;
            onCloseRef.current?.();
        }
    }, [current]);

    const available = NAV
        .map((s) => ({ ...s, items: s.items.filter((i) => route().has(i.route)) }))
        .filter((s) => s.items.length > 0);

    return (
        <Transition show={open} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 lg:hidden">
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="-translate-x-full rtl:translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full rtl:translate-x-full"
                    >
                        <Dialog.Panel className="flex h-full w-72 max-w-[85vw] flex-col bg-base-100 shadow-xl">
                            <div className="flex h-16 items-center justify-between border-b border-base-300 px-4">
                                <div className="flex items-center gap-2">
                                    <ApplicationLogo className="h-7 w-7 fill-primary" />
                                    <span className="text-base font-bold">DeenMate</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn btn-ghost btn-sm btn-square"
                                    aria-label={t('Close menu')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto py-3">
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
                                            />
                                        ))}
                                    </SidebarSection>
                                ))}
                            </nav>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
