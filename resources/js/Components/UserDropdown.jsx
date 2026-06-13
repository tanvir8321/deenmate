import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, usePage } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';

function ChevronUpIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4 opacity-60"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
    );
}

function ProfileIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function LogOutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    );
}

export default function UserDropdown({ align = 'end', showName = false, containerClass = '' }) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const menuWidth = 224;
        const gap = 8;
        if (align === 'top') {
            setPos({
                top: rect.top - gap,
                left: rect.right - menuWidth,
            });
        } else {
            setPos({
                top: rect.bottom + gap,
                left: rect.right - menuWidth,
            });
        }
    }, [align]);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        const onPointer = (e) => {
            if (menuRef.current?.contains(e.target)) return;
            if (triggerRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('touchstart', onPointer);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('touchstart', onPointer);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, updatePosition]);

    const close = () => setOpen(false);

    const widthClass = showName ? 'w-full' : '';

    const trigger = (
        <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition hover:bg-base-200 ${
                showName ? 'w-full' : ''
            } ${showName ? 'justify-start' : ''}`}
            aria-label={t('Account menu')}
            aria-haspopup="menu"
            aria-expanded={open}
        >
            <div className="avatar placeholder shrink-0">
                <div className={`rounded-full bg-primary text-primary-content ${showName ? 'w-8' : 'w-7'}`}>
                    <span className="text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
                </div>
            </div>
            {showName && (
                <>
                    <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-xs font-semibold text-base-content">{user.name}</p>
                        <p className="truncate text-xs text-base-content/60">{user.email}</p>
                    </div>
                    <ChevronUpIcon />
                </>
            )}
        </button>
    );

    return (
        <div className={`relative ${widthClass} ${containerClass}`.trim()}>
            {trigger}
            {open &&
                createPortal(
                    <ul
                        ref={menuRef}
                        role="menu"
                        style={{ position: 'fixed', top: pos.top, left: pos.left }}
                        className="z-[1000] menu menu-sm w-56 rounded-box bg-base-100 p-2 shadow-lg ring-1 ring-base-300"
                    >
                        <li>
                            <Link href={route('profile.edit')} onClick={close} role="menuitem">
                                <ProfileIcon />
                                {t('Profile')}
                            </Link>
                        </li>
                        <li>
                            <Link href={route('settings.edit')} onClick={close} role="menuitem">
                                <SettingsIcon />
                                {t('Settings')}
                            </Link>
                        </li>
                        <li>
                            <Link href={route('logout')} method="post" as="button" onClick={close} role="menuitem">
                                <LogOutIcon />
                                {t('Log Out')}
                            </Link>
                        </li>
                    </ul>,
                    document.body,
                )}
        </div>
    );
}
