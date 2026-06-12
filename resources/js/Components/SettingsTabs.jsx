import { useState, useEffect, useRef } from 'react';

const TABS = [
    { key: 'prayer', labelKey: 'SettingsTabPrayer' },
    { key: 'calendar', labelKey: 'SettingsTabCalendar' },
    { key: 'notifications', labelKey: 'SettingsTabNotifications' },
    { key: 'privacy', labelKey: 'SettingsTabPrivacy' },
    { key: 'account', labelKey: 'SettingsTabAccount' },
];

export default function SettingsTabs({ active, onChange, labels }) {
    const [internal, setInternal] = useState(active ?? 'prayer');
    const current = active ?? internal;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (active && active !== internal) setInternal(active);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const hash = window.location.hash?.replace('#', '');
        if (hash && TABS.some((t) => t.key === hash)) {
            if (!active) setInternal(hash);
            onChangeRef.current?.(hash);
            if (window.history?.replaceState) {
                window.history.replaceState(null, '', `#${hash}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handle = (key) => {
        if (!active) setInternal(key);
        onChange?.(key);
        if (typeof window !== 'undefined' && window.history?.replaceState) {
            window.history.replaceState(null, '', `#${key}`);
        }
    };

    return (
        <div className="overflow-x-auto" role="tablist" aria-label="Settings sections">
            <div className="tabs tabs-lifted min-w-max">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={current === tab.key}
                        onClick={() => handle(tab.key)}
                        className={`tab whitespace-nowrap text-sm sm:text-base ${current === tab.key ? 'tab-active' : ''}`}
                    >
                        {labels[tab.key] ?? tab.key}
                    </button>
                ))}
            </div>
        </div>
    );
}
