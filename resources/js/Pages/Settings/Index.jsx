import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';
import { usePushNotifications } from '@/hooks/usePushNotifications';

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

export default function Index({ settings }) {
    const { t } = useTranslation();
    const { subscription, supported, subscribe, unsubscribe, test } = usePushNotifications();
    const [testing, setTesting] = useState(false);
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        timezone: settings.timezone ?? 'UTC',
        locale: settings.locale ?? 'en',
        lat: settings.lat ?? '',
        lng: settings.lng ?? '',
        calc_method: settings.calc_method ?? 'karachi',
        asr_method: settings.asr_method ?? 'hanafi',
        high_lat_rule: settings.high_lat_rule ?? 'none',
        hijri_offset: settings.hijri_offset ?? 0,
        quiet_start: settings.quiet_start ?? '',
        quiet_end: settings.quiet_end ?? '',
    });

    const timezones =
        typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            setData((prev) => ({
                ...prev,
                lat: pos.coords.latitude.toFixed(5),
                lng: pos.coords.longitude.toFixed(5),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? prev.timezone,
            }));
        });
    };

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
            }),
        });
    };

    const selectClasses =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('Settings')}</h2>
            }
        >
            <Head title={t('Settings')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="space-y-8 bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800"
                    >
                        <section className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Location')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {t(
                                    'Used only to calculate prayer times. Stored as approximate coordinates, never tracked.',
                                )}
                            </p>
                            <SecondaryButton type="button" onClick={detectLocation}>
                                {t('Detect my location')}
                            </SecondaryButton>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="lat" value={t('Latitude')} />
                                    <TextInput
                                        id="lat"
                                        className="mt-1 block w-full"
                                        value={data.lat}
                                        onChange={(e) => setData('lat', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.lat} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="lng" value={t('Longitude')} />
                                    <TextInput
                                        id="lng"
                                        className="mt-1 block w-full"
                                        value={data.lng}
                                        onChange={(e) => setData('lng', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.lng} />
                                </div>
                            </div>
                            <div>
                                <InputLabel htmlFor="timezone" value={t('Timezone')} />
                                <select
                                    id="timezone"
                                    className={selectClasses}
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                >
                                    {timezones.map((tz) => (
                                        <option key={tz} value={tz}>
                                            {tz}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.timezone} />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Prayer time calculation')}
                            </h3>
                            <div>
                                <InputLabel htmlFor="calc_method" value={t('Calculation method')} />
                                <select
                                    id="calc_method"
                                    className={selectClasses}
                                    value={data.calc_method}
                                    onChange={(e) => setData('calc_method', e.target.value)}
                                >
                                    {CALC_METHODS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {t(label)}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.calc_method} />
                            </div>
                            <div>
                                <InputLabel value={t('Asr method (madhab)')} />
                                <div className="mt-2 flex gap-6">
                                    {[
                                        ['hanafi', 'Hanafi'],
                                        ['standard', 'Standard (Shafi/Maliki/Hanbali)'],
                                    ].map(([value, label]) => (
                                        <label key={value} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="asr_method"
                                                value={value}
                                                checked={data.asr_method === value}
                                                onChange={(e) => setData('asr_method', e.target.value)}
                                                className="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {t(label)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <InputError className="mt-2" message={errors.asr_method} />
                            </div>
                            <div>
                                <InputLabel htmlFor="high_lat_rule" value={t('High-latitude rule')} />
                                <select
                                    id="high_lat_rule"
                                    className={selectClasses}
                                    value={data.high_lat_rule}
                                    onChange={(e) => setData('high_lat_rule', e.target.value)}
                                >
                                    {HIGH_LAT_RULES.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {t(label)}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.high_lat_rule} />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Calendar & language')}
                            </h3>
                            <div>
                                <InputLabel htmlFor="locale" value={t('Language')} />
                                <select
                                    id="locale"
                                    className={selectClasses}
                                    value={data.locale}
                                    onChange={(e) => setData('locale', e.target.value)}
                                >
                                    {LOCALES.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.locale} />
                            </div>
                            <div>
                                <InputLabel htmlFor="hijri_offset" value={t('Hijri date adjustment')} />
                                <p className="text-sm text-gray-500">
                                    {t('Adjust if your local moonsighting differs from the calculated date.')}
                                </p>
                                <select
                                    id="hijri_offset"
                                    className={selectClasses}
                                    value={data.hijri_offset}
                                    onChange={(e) => setData('hijri_offset', Number(e.target.value))}
                                >
                                    {[-2, -1, 0, 1, 2].map((n) => (
                                        <option key={n} value={n}>
                                            {n > 0 ? `+${n}` : n} {t('days')}
                                        </option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.hijri_offset} />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Quiet hours')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {t('No reminders will be sent during quiet hours.')}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="quiet_start" value={t('From')} />
                                    <TextInput
                                        id="quiet_start"
                                        type="time"
                                        className="mt-1 block w-full"
                                        value={data.quiet_start}
                                        onChange={(e) => setData('quiet_start', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.quiet_start} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="quiet_end" value={t('To')} />
                                    <TextInput
                                        id="quiet_end"
                                        type="time"
                                        className="mt-1 block w-full"
                                        value={data.quiet_end}
                                        onChange={(e) => setData('quiet_end', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.quiet_end} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {t('Push notifications')}
                            </h3>
                            {supported ? (
                                <div className="space-y-3">
                                    {subscription ? (
                                        <>
                                            <p className="text-sm text-green-600">
                                                {t('Notifications enabled')}
                                            </p>
                                            <div className="flex gap-3">
                                                <SecondaryButton
                                                    type="button"
                                                    onClick={async () => {
                                                        setTesting(true);
                                                        await test();
                                                        setTesting(false);
                                                    }}
                                                    disabled={testing}
                                                >
                                                    {testing ? t('Sending') : t('Send test notification')}
                                                </SecondaryButton>
                                                <SecondaryButton
                                                    type="button"
                                                    onClick={unsubscribe}
                                                >
                                                    {t('Disable notifications')}
                                                </SecondaryButton>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500">
                                                {t('Enable push notifications to receive reminders.')}
                                            </p>
                                            <PrimaryButton type="button" onClick={subscribe}>
                                                {t('Enable notifications')}
                                            </PrimaryButton>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    {t('Push notifications not supported in this browser.')}
                                </p>
                            )}
                        </section>

                        <div className="flex items-center gap-4">
                            <PrimaryButton disabled={processing}>{t('Save')}</PrimaryButton>
                            {recentlySuccessful && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Saved.')}</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
