import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Container from '@/Components/Container';
import PageHeader from '@/Components/PageHeader';
import SettingsCard from '@/Components/SettingsCard';
import SettingsField from '@/Components/SettingsField';
import SettingsTabs from '@/Components/SettingsTabs';
import NotificationChannelToggle from '@/Components/NotificationChannelToggle';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import useGeolocation from '@/hooks/useGeolocation';

const CALC_METHODS = [
    ['karachi', 'University of Islamic Sciences, Karachi'],
    ['mwl', 'Muslim World League'],
    ['isna', 'Islamic Society of North America (ISNA)'],
    ['egypt', 'Egyptian General Authority of Survey'],
    ['umm_al_qura', 'Umm al-Qura University, Makkah'],
    ['tehran', 'Institute of Geophysics, Tehran'],
    ['gulf', 'Gulf Region'],
    ['moonsighting', 'Moonsighting Committee'],
];

const HIGH_LAT_RULES = [
    ['none', 'None'],
    ['middle_of_night', 'Middle of the night'],
    ['one_seventh', 'One-seventh of the night'],
    ['angle_based', 'Angle-based'],
];

const LOCALES = [
    ['en', 'English'],
    ['bn', 'বাংলা'],
    ['ar', 'العربية'],
    ['ur', 'اردو'],
    ['tr', 'Türkçe'],
    ['id', 'Bahasa Indonesia'],
];

const NOTIFICATION_CHANNELS = [
    { key: 'salah_reminder', label: 'NotifChannelSalah', desc: 'NotifChannelSalahDesc' },
    { key: 'morning_briefing', label: 'NotifChannelMorning', desc: 'NotifChannelMorningDesc' },
    { key: 'evening_briefing', label: 'NotifChannelEvening', desc: 'NotifChannelEveningDesc' },
    { key: 'adhkar_reminder', label: 'NotifChannelAdhkar', desc: 'NotifChannelAdhkarDesc' },
    { key: 'fasting_reminder', label: 'NotifChannelFasting', desc: 'NotifChannelFastingDesc' },
    { key: 'weekly_report', label: 'NotifChannelWeekly', desc: 'NotifChannelWeeklyDesc' },
];

const TAB_LABELS = {
    prayer: 'SettingsTabPrayer',
    calendar: 'SettingsTabCalendar',
    notifications: 'SettingsTabNotifications',
    privacy: 'SettingsTabPrivacy',
    account: 'SettingsTabAccount',
};

const FORM_TABS = ['prayer', 'calendar', 'notifications', 'account'];

function formatDate(iso, locale) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Index({ settings, notificationPreferences, accountInfo }) {
    const { t, locale } = useTranslation();
    const [tab, setTab] = useState('prayer');
    const push = usePushNotifications();
    const [testing, setTesting] = useState(false);
    const geo = useGeolocation();

    const { data, setData, patch, errors, processing, recentlySuccessful, isDirty } = useForm({
        timezone: settings.timezone ?? 'UTC',
        locale: settings.locale ?? 'en',
        theme: settings.theme ?? 'deenmate',
        display_name: settings.display_name ?? '',
        lat: settings.lat ?? '',
        lng: settings.lng ?? '',
        calc_method: settings.calc_method ?? 'karachi',
        asr_method: settings.asr_method ?? 'hanafi',
        high_lat_rule: settings.high_lat_rule ?? 'none',
        hijri_offset: settings.hijri_offset ?? 0,
        quiet_start: settings.quiet_start ?? '',
        quiet_end: settings.quiet_end ?? '',
        notification_preferences: notificationPreferences ?? {},
    });

    const timezones =
        typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const html = document.documentElement;
        if (data.theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else if (data.theme === 'system') {
            const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', prefersDark ? 'dark' : 'deenmate');
        } else {
            html.setAttribute('data-theme', 'deenmate');
        }
        try {
            localStorage.setItem('deenmate.theme', data.theme);
        } catch {
            // localStorage unavailable
        }
    }, [data.theme]);

    useEffect(() => {
        if (geo.coords) {
            setData((prev) => ({
                ...prev,
                lat: geo.coords.lat.toFixed(5),
                lng: geo.coords.lng.toFixed(5),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? prev.timezone,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geo.coords]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.update'), {
            preserveScroll: true,
            transform: (form) => ({
                ...form,
                lat: form.lat === '' ? null : form.lat,
                lng: form.lng === '' ? null : form.lng,
                quiet_start: form.quiet_start === '' ? null : form.quiet_start,
                quiet_end: form.quiet_end === '' ? null : form.quiet_end,
                display_name: form.display_name === '' ? null : form.display_name,
            }),
        });
    };

    const clearLocation = () => {
        setData((prev) => ({ ...prev, lat: '', lng: '' }));
    };

    const updatePref = (key, value) => {
        setData('notification_preferences', { ...data.notification_preferences, [key]: value });
    };

    const inputCls = 'input input-bordered w-full';
    const selectCls = 'select select-bordered w-full';
    const tabLabelsResolved = Object.fromEntries(
        Object.entries(TAB_LABELS).map(([k, key]) => [k, t(key)]),
    );

    const showSave = FORM_TABS.includes(tab) && isDirty;
    const memberSince = formatDate(accountInfo?.created_at, locale);

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-base-content">{t('Settings')}</h2>}
        >
            <Head title={t('Settings')} />

            <Container className="space-y-3 sm:space-y-4">
                <PageHeader
                    title={t('Settings')}
                    subtitle={t('Personalize your daily worship experience')}
                    badge={
                        recentlySuccessful && (
                            <span className="badge badge-success badge-sm gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {t('Saved.')}
                            </span>
                        )
                    }
                />

                <SettingsTabs active={tab} onChange={setTab} labels={tabLabelsResolved} />

                <form onSubmit={submit} className="space-y-3 sm:space-y-4">
                    {tab === 'prayer' && (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 3xl:grid-cols-3">
                            <SettingsCard
                                title={t('Location')}
                                subtitle={t('Used only to calculate prayer times. Stored as approximate coordinates, never tracked.')}
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <SecondaryButton
                                        type="button"
                                        onClick={geo.request}
                                        disabled={geo.loading}
                                        className="w-full sm:w-auto"
                                    >
                                        {geo.loading && <span className="loading loading-spinner loading-xs me-1" />}
                                        {t('Detect my location')}
                                    </SecondaryButton>
                                    {(data.lat || data.lng) && (
                                        <SecondaryButton
                                            type="button"
                                            onClick={clearLocation}
                                            className="w-full sm:w-auto"
                                        >
                                            {t('Clear')}
                                        </SecondaryButton>
                                    )}
                                </div>
                                {geo.errorKey && (
                                    <p className="text-xs text-error">{t(geo.errorKey)}</p>
                                )}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <SettingsField label={t('Latitude')} htmlFor="lat" error={errors.lat}>
                                        <TextInput
                                            id="lat"
                                            className={inputCls}
                                            value={data.lat}
                                            onChange={(e) => setData('lat', e.target.value)}
                                            inputMode="decimal"
                                        />
                                    </SettingsField>
                                    <SettingsField label={t('Longitude')} htmlFor="lng" error={errors.lng}>
                                        <TextInput
                                            id="lng"
                                            className={inputCls}
                                            value={data.lng}
                                            onChange={(e) => setData('lng', e.target.value)}
                                            inputMode="decimal"
                                        />
                                    </SettingsField>
                                </div>
                                <SettingsField label={t('Timezone')} htmlFor="timezone" error={errors.timezone}>
                                    <select
                                        id="timezone"
                                        className={selectCls}
                                        value={data.timezone}
                                        onChange={(e) => setData('timezone', e.target.value)}
                                    >
                                        {timezones.map((tz) => (
                                            <option key={tz} value={tz}>
                                                {tz}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>
                            </SettingsCard>

                            <SettingsCard
                                title={t('Prayer time calculation')}
                                subtitle={t('Choose the calculation method and madhab for Asr.')}
                            >
                                <SettingsField label={t('Calculation method')} htmlFor="calc_method" error={errors.calc_method}>
                                    <select
                                        id="calc_method"
                                        className={selectCls}
                                        value={data.calc_method}
                                        onChange={(e) => setData('calc_method', e.target.value)}
                                    >
                                        {CALC_METHODS.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {t(label)}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>

                                <SettingsField label={t('Asr method (madhab)')} error={errors.asr_method}>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {[
                                            ['hanafi', 'Hanafi'],
                                            ['standard', 'Standard (Shafi/Maliki/Hanbali)'],
                                        ].map(([value, label]) => (
                                            <label
                                                key={value}
                                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 p-3 transition hover:border-primary"
                                            >
                                                <input
                                                    type="radio"
                                                    name="asr_method"
                                                    value={value}
                                                    checked={data.asr_method === value}
                                                    onChange={(e) => setData('asr_method', e.target.value)}
                                                    className="radio radio-primary radio-sm"
                                                />
                                                <span className="text-sm text-base-content">{t(label)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </SettingsField>

                                <SettingsField label={t('High-latitude rule')} htmlFor="high_lat_rule" error={errors.high_lat_rule}>
                                    <select
                                        id="high_lat_rule"
                                        className={selectCls}
                                        value={data.high_lat_rule}
                                        onChange={(e) => setData('high_lat_rule', e.target.value)}
                                    >
                                        {HIGH_LAT_RULES.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {t(label)}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>
                            </SettingsCard>

                            <SettingsCard
                                title={t('Quiet hours')}
                                subtitle={t('No reminders will be sent during quiet hours.')}
                                className="lg:col-span-2 3xl:col-span-1"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <SettingsField label={t('From')} htmlFor="quiet_start" error={errors.quiet_start}>
                                        <TextInput
                                            id="quiet_start"
                                            type="time"
                                            className={inputCls}
                                            value={data.quiet_start}
                                            onChange={(e) => setData('quiet_start', e.target.value)}
                                        />
                                    </SettingsField>
                                    <SettingsField label={t('To')} htmlFor="quiet_end" error={errors.quiet_end}>
                                        <TextInput
                                            id="quiet_end"
                                            type="time"
                                            className={inputCls}
                                            value={data.quiet_end}
                                            onChange={(e) => setData('quiet_end', e.target.value)}
                                        />
                                    </SettingsField>
                                </div>
                            </SettingsCard>
                        </div>
                    )}

                    {tab === 'calendar' && (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 3xl:grid-cols-3">
                            <SettingsCard title={t('Calendar & language')}>
                                <SettingsField label={t('Language')} htmlFor="locale" error={errors.locale}>
                                    <select
                                        id="locale"
                                        className={selectCls}
                                        value={data.locale}
                                        onChange={(e) => setData('locale', e.target.value)}
                                    >
                                        {LOCALES.map(([value, label]) => (
                                            <option key={value} value={label}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>
                                <SettingsField
                                    label={t('Hijri date adjustment')}
                                    hint={t('Adjust if your local moonsighting differs from the calculated date.')}
                                    error={errors.hijri_offset}
                                >
                                    <select
                                        id="hijri_offset"
                                        className={selectCls}
                                        value={data.hijri_offset}
                                        onChange={(e) => setData('hijri_offset', Number(e.target.value))}
                                    >
                                        {[-2, -1, 0, 1, 2].map((n) => (
                                            <option key={n} value={n}>
                                                {n > 0 ? `+${n}` : n} {t('days')}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>
                            </SettingsCard>
                        </div>
                    )}

                    {tab === 'notifications' && (
                        <div className="space-y-3 sm:space-y-4">
                            <SettingsCard
                                title={t('Push notifications')}
                                subtitle={t('Receive reminders for prayer times and daily checklist.')}
                            >
                                {push.supported ? (
                                    <div className="space-y-3">
                                        {push.subscription ? (
                                            <>
                                                <div className="alert alert-success">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    <span className="text-sm">{t('Notifications enabled')}</span>
                                                </div>
                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <SecondaryButton
                                                        type="button"
                                                        onClick={async () => {
                                                            setTesting(true);
                                                            await push.test();
                                                            setTesting(false);
                                                        }}
                                                        disabled={testing}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        {testing ? t('Sending') : t('Send test notification')}
                                                    </SecondaryButton>
                                                    <SecondaryButton type="button" onClick={push.unsubscribe} className="w-full sm:w-auto">
                                                        {t('Disable notifications')}
                                                    </SecondaryButton>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-base-content/70">
                                                    {t('Enable push notifications to receive reminders.')}
                                                </p>
                                                <PrimaryButton type="button" onClick={push.subscribe} className="w-full sm:w-auto">
                                                    {t('Enable notifications')}
                                                </PrimaryButton>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-base-content/60">
                                        {t('Push notifications not supported in this browser.')}
                                    </p>
                                )}
                            </SettingsCard>

                            <SettingsCard
                                title={t('Notification channels')}
                                subtitle={t('Choose which reminders you want to receive.')}
                            >
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {NOTIFICATION_CHANNELS.map((ch) => (
                                        <NotificationChannelToggle
                                            key={ch.key}
                                            label={t(ch.label)}
                                            description={t(ch.desc)}
                                            value={data.notification_preferences?.[ch.key] ?? false}
                                            onChange={(v) => updatePref(ch.key, v)}
                                        />
                                    ))}
                                </div>
                            </SettingsCard>
                        </div>
                    )}

                    {tab === 'privacy' && (
                        <div className="space-y-3 sm:space-y-4">
                            <SettingsCard
                                title={t('Your data')}
                                subtitle={t('Your worship data stays yours. Export or delete at any time.')}
                            >
                                <div className="divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300">
                                    {[
                                        { route: 'export.salah', label: 'Salah logs export', format: 'CSV' },
                                        { route: 'export.tasks', label: 'Completed tasks export', format: 'XLSX' },
                                        { route: 'export.quran', label: 'Quran progress export', format: 'XLSX' },
                                        { route: 'export.full', label: 'Full account export', format: 'JSON' },
                                    ].map((row) => (
                                        <div key={row.route} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-base-content">{t(row.label)}</p>
                                                <p className="text-xs text-base-content/60">{row.format}</p>
                                            </div>
                                            <a
                                                href={route(row.route)}
                                                className="btn btn-outline btn-sm w-full sm:w-auto"
                                            >
                                                {t('Export')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </SettingsCard>

                            <SettingsCard title={t('Danger zone')}>
                                <div className="alert alert-warning">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                    <div className="text-sm">
                                        {t('Deleting your account is permanent and cannot be undone.')}
                                    </div>
                                </div>
                                <Link
                                    href={`${route('profile.edit')}#danger`}
                                    className="btn btn-error btn-sm w-full sm:w-auto"
                                >
                                    {t('Delete account')}
                                </Link>
                            </SettingsCard>
                        </div>
                    )}

                    {tab === 'account' && (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 3xl:grid-cols-3">
                            <SettingsCard
                                title={t('Display')}
                                subtitle={t('Shown instead of your real name on circles and exports.')}
                            >
                                <SettingsField label={t('Display name')} htmlFor="display_name" error={errors.display_name} hint={t('Optional. Max 60 characters.')}>
                                    <TextInput
                                        id="display_name"
                                        className={inputCls}
                                        value={data.display_name}
                                        onChange={(e) => setData('display_name', e.target.value)}
                                        maxLength={60}
                                    />
                                </SettingsField>
                            </SettingsCard>

                            <SettingsCard
                                title={t('Appearance')}
                                subtitle={t('Theme for the entire app.')}
                            >
                                <SettingsField label={t('Theme')}>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        {[
                                            ['deenmate', 'Light', 'bg-base-100 text-base-content border-base-300'],
                                            ['dark', 'Dark', 'bg-neutral text-neutral-content border-neutral'],
                                            ['system', 'System', 'bg-gradient-to-r from-base-100 to-neutral text-base-content border-base-300'],
                                        ].map(([value, label, preview]) => (
                                            <label
                                                key={value}
                                                className={`flex cursor-pointer flex-col items-start gap-2 rounded-lg border-2 p-3 transition ${
                                                    data.theme === value ? 'border-primary' : 'border-base-300 hover:border-primary/50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value={value}
                                                    checked={data.theme === value}
                                                    onChange={(e) => setData('theme', e.target.value)}
                                                    className="radio radio-primary radio-sm"
                                                />
                                                <div className={`w-full rounded p-2 text-center text-xs font-medium ${preview}`}>
                                                    {label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </SettingsField>
                            </SettingsCard>

                            <SettingsCard
                                title={t('Account info')}
                                className="lg:col-span-2 3xl:col-span-1"
                            >
                                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-medium text-base-content/60">{t('Email')}</dt>
                                        <dd className="mt-0.5 flex items-center gap-2 text-sm text-base-content">
                                            {accountInfo?.email ?? '—'}
                                            {accountInfo?.email_verified_at && (
                                                <span className="badge badge-success badge-xs">{t('Verified')}</span>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-base-content/60">{t('Member since')}</dt>
                                        <dd className="mt-0.5 text-sm text-base-content">{memberSince}</dd>
                                    </div>
                                </dl>
                                <div className="divider my-2" />
                                <Link href={route('profile.edit')} className="link link-primary text-sm">
                                    {t('Manage account')} →
                                </Link>
                            </SettingsCard>
                        </div>
                    )}

                    {showSave && (
                        <div className="sticky bottom-0 z-10 -mx-3 border-t border-base-300 bg-base-100/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <PrimaryButton type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {t('Save')}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </form>
            </Container>
        </AuthenticatedLayout>
    );
}
