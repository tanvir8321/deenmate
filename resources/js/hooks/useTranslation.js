import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

const RTL_LOCALES = ['ar', 'ur'];

/**
 * Lightweight i18n: translations for the active locale are shared via
 * Inertia props (lang/{locale}.json, English strings as keys).
 */
export default function useTranslation() {
    const { locale = 'en', translations = {} } = usePage().props;

    const t = useCallback(
        (key, replacements = {}) => {
            let line = translations[key] ?? key;
            Object.entries(replacements).forEach(([from, to]) => {
                line = line.replaceAll(`:${from}`, String(to));
            });
            return line;
        },
        [translations],
    );

    return { t, locale, isRtl: RTL_LOCALES.includes(locale) };
}
