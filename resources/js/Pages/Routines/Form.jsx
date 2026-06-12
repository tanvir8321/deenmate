import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const CATEGORIES = ['salah', 'adhkar', 'quran', 'fasting', 'finance', 'general'];
const ANCHORS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const HIJRI_MONTHS = [
    'Muharram',
    'Safar',
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    'Jumada al-Ula',
    'Jumada al-Akhirah',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhul-Qa'dah",
    'Dhul-Hijjah',
];
const FREQS = [
    ['daily', 'Every day'],
    ['weekly', 'Specific weekdays'],
    ['monthly', 'Monthly (Gregorian)'],
    ['yearly', 'Yearly (Gregorian)'],
    ['hijri_monthly', 'Hijri days each month'],
    ['hijri_yearly', 'Hijri yearly'],
    ['interval', 'Every N days'],
];

const selectClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500';

export default function Form({ routine }) {
    const { t } = useTranslation();
    const editing = routine !== null;
    const today = new Date().toISOString().slice(0, 10);

    const { data, setData, post, put, errors, processing } = useForm({
        title: routine?.title ?? '',
        category: routine?.category ?? 'general',
        recurrence: routine?.recurrence ?? { freq: 'daily' },
        anchor: routine?.anchor ?? '',
        offset_minutes: routine?.offset_minutes ?? 0,
        fixed_time: routine?.fixed_time ?? '',
        reminder_enabled: routine?.reminder_enabled ?? false,
        nag_mode: routine?.nag_mode ?? false,
        starts_on: routine?.starts_on ?? today,
        ends_on: routine?.ends_on ?? '',
        is_active: routine?.is_active ?? true,
        timing: routine?.anchor ? 'anchor' : routine?.fixed_time ? 'fixed' : 'anytime',
    });

    const setRule = (patch) => setData('recurrence', { ...data.recurrence, ...patch });

    const setFreq = (freq) => setData('recurrence', { freq });

    const toggleArrayValue = (key, value) => {
        const current = data.recurrence[key] ?? [];
        setRule({
            [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const transform = (form) => ({
            ...form,
            anchor: form.timing === 'anchor' && form.anchor !== '' ? form.anchor : null,
            offset_minutes: form.timing === 'anchor' ? Number(form.offset_minutes) || 0 : 0,
            fixed_time: form.timing === 'fixed' && form.fixed_time !== '' ? form.fixed_time : null,
            ends_on: form.ends_on === '' ? null : form.ends_on,
            timing: undefined,
        });

        if (editing) {
            put(route('routines.update', routine.id), { transform });
        } else {
            post(route('routines.store'), { transform });
        }
    };

    const freq = data.recurrence.freq;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {editing ? t('Edit routine') : t('New routine')}
                </h2>
            }
        >
            <Head title={editing ? t('Edit routine') : t('New routine')} />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6 rounded-lg bg-white p-6 shadow">
                        <div>
                            <InputLabel htmlFor="title" value={t('Title')} />
                            <TextInput
                                id="title"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder={t('e.g. Read Surah Mulk')}
                            />
                            <InputError className="mt-2" message={errors.title} />
                        </div>

                        <div>
                            <InputLabel htmlFor="category" value={t('Category')} />
                            <select
                                id="category"
                                className={selectClasses}
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {t(c)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <fieldset className="space-y-3">
                            <legend className="text-sm font-medium text-gray-700">{t('Repeats')}</legend>
                            <select
                                className={selectClasses}
                                value={freq}
                                onChange={(e) => setFreq(e.target.value)}
                                aria-label={t('Recurrence type')}
                            >
                                {FREQS.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {t(label)}
                                    </option>
                                ))}
                            </select>

                            {freq === 'weekly' && (
                                <div className="flex flex-wrap gap-2">
                                    {WEEKDAYS.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleArrayValue('days', day)}
                                            className={`rounded-full px-3 py-1 text-sm capitalize ${
                                                (data.recurrence.days ?? []).includes(day)
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {t(day)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors['recurrence.days']} />

                            {freq === 'monthly' && (
                                <div>
                                    <InputLabel htmlFor="dom" value={t('Day of month')} />
                                    <TextInput
                                        id="dom"
                                        type="number"
                                        min="1"
                                        max="31"
                                        className="mt-1 block w-32"
                                        value={data.recurrence.day_of_month ?? ''}
                                        onChange={(e) => setRule({ day_of_month: Number(e.target.value) })}
                                    />
                                    <InputError message={errors['recurrence.day_of_month']} />
                                </div>
                            )}

                            {freq === 'yearly' && (
                                <div className="flex gap-4">
                                    <div>
                                        <InputLabel htmlFor="ymonth" value={t('Month')} />
                                        <TextInput
                                            id="ymonth"
                                            type="number"
                                            min="1"
                                            max="12"
                                            className="mt-1 block w-24"
                                            value={data.recurrence.month ?? ''}
                                            onChange={(e) => setRule({ month: Number(e.target.value) })}
                                        />
                                        <InputError message={errors['recurrence.month']} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="yday" value={t('Day')} />
                                        <TextInput
                                            id="yday"
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="mt-1 block w-24"
                                            value={data.recurrence.day ?? ''}
                                            onChange={(e) => setRule({ day: Number(e.target.value) })}
                                        />
                                        <InputError message={errors['recurrence.day']} />
                                    </div>
                                </div>
                            )}

                            {freq === 'hijri_monthly' && (
                                <div>
                                    <InputLabel value={t('Hijri days (e.g. 13, 14, 15 — the white days)')} />
                                    <div className="mt-2 grid grid-cols-10 gap-1">
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleArrayValue('hijri_days', day)}
                                                className={`rounded p-1 text-xs ${
                                                    (data.recurrence.hijri_days ?? []).includes(day)
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors['recurrence.hijri_days']} />
                                </div>
                            )}

                            {freq === 'hijri_yearly' && (
                                <div className="space-y-3">
                                    <div>
                                        <InputLabel htmlFor="hmonth" value={t('Hijri month')} />
                                        <select
                                            id="hmonth"
                                            className={selectClasses}
                                            value={data.recurrence.hijri_month ?? ''}
                                            onChange={(e) => setRule({ hijri_month: Number(e.target.value) })}
                                        >
                                            <option value="">{t('Select…')}</option>
                                            {HIJRI_MONTHS.map((name, i) => (
                                                <option key={name} value={i + 1}>
                                                    {t(name)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors['recurrence.hijri_month']} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="hday" value={t('Hijri day (leave empty for the whole month)')} />
                                        <TextInput
                                            id="hday"
                                            type="number"
                                            min="1"
                                            max="30"
                                            className="mt-1 block w-24"
                                            value={data.recurrence.hijri_day ?? ''}
                                            onChange={(e) =>
                                                setRule({
                                                    hijri_day: e.target.value === '' ? null : Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {freq === 'interval' && (
                                <div>
                                    <InputLabel htmlFor="every" value={t('Every how many days?')} />
                                    <TextInput
                                        id="every"
                                        type="number"
                                        min="1"
                                        max="365"
                                        className="mt-1 block w-24"
                                        value={data.recurrence.every_days ?? ''}
                                        onChange={(e) => setRule({ every_days: Number(e.target.value) })}
                                    />
                                    <InputError message={errors['recurrence.every_days']} />
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="space-y-3">
                            <legend className="text-sm font-medium text-gray-700">{t('Time')}</legend>
                            <div className="flex gap-4">
                                {[
                                    ['anytime', 'Anytime'],
                                    ['anchor', 'Relative to a prayer'],
                                    ['fixed', 'Fixed time'],
                                ].map(([value, label]) => (
                                    <label key={value} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="timing"
                                            value={value}
                                            checked={data.timing === value}
                                            onChange={(e) => setData('timing', e.target.value)}
                                            className="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        {t(label)}
                                    </label>
                                ))}
                            </div>

                            {data.timing === 'anchor' && (
                                <div className="flex gap-4">
                                    <div>
                                        <InputLabel htmlFor="anchor" value={t('Prayer')} />
                                        <select
                                            id="anchor"
                                            className={selectClasses}
                                            value={data.anchor}
                                            onChange={(e) => setData('anchor', e.target.value)}
                                        >
                                            <option value="">{t('Select…')}</option>
                                            {ANCHORS.map((a) => (
                                                <option key={a} value={a}>
                                                    {t(a.charAt(0).toUpperCase() + a.slice(1))}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.anchor} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="offset" value={t('Offset (minutes)')} />
                                        <TextInput
                                            id="offset"
                                            type="number"
                                            min="-180"
                                            max="300"
                                            className="mt-1 block w-28"
                                            value={data.offset_minutes}
                                            onChange={(e) => setData('offset_minutes', e.target.value)}
                                        />
                                        <InputError message={errors.offset_minutes} />
                                    </div>
                                </div>
                            )}

                            {data.timing === 'fixed' && (
                                <div>
                                    <InputLabel htmlFor="fixed_time" value={t('Time')} />
                                    <TextInput
                                        id="fixed_time"
                                        type="time"
                                        className="mt-1 block w-36"
                                        value={data.fixed_time}
                                        onChange={(e) => setData('fixed_time', e.target.value)}
                                    />
                                    <InputError message={errors.fixed_time} />
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="space-y-2">
                            <legend className="text-sm font-medium text-gray-700">{t('Reminders')}</legend>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.reminder_enabled}
                                    onChange={(e) => setData('reminder_enabled', e.target.checked)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                {t('Remind me')}
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.nag_mode}
                                    onChange={(e) => setData('nag_mode', e.target.checked)}
                                    disabled={!data.reminder_enabled}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                {t('Nag me until done (every 30 min, max 4 times)')}
                            </label>
                        </fieldset>

                        <div className="flex gap-4">
                            <div>
                                <InputLabel htmlFor="starts_on" value={t('Starts on')} />
                                <TextInput
                                    id="starts_on"
                                    type="date"
                                    className="mt-1 block"
                                    value={data.starts_on}
                                    onChange={(e) => setData('starts_on', e.target.value)}
                                />
                                <InputError message={errors.starts_on} />
                            </div>
                            <div>
                                <InputLabel htmlFor="ends_on" value={t('Ends on (optional)')} />
                                <TextInput
                                    id="ends_on"
                                    type="date"
                                    className="mt-1 block"
                                    value={data.ends_on}
                                    onChange={(e) => setData('ends_on', e.target.value)}
                                />
                                <InputError message={errors.ends_on} />
                            </div>
                        </div>

                        {editing && (
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                {t('Active')}
                            </label>
                        )}

                        <PrimaryButton disabled={processing}>
                            {editing ? t('Save changes') : t('Create routine')}
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
