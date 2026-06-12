import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

export default function SettingsField({
    label,
    htmlFor,
    error = null,
    hint = null,
    children,
    className = '',
}) {
    return (
        <div className={`form-control w-full ${className}`}>
            {label && (
                <InputLabel htmlFor={htmlFor} value={label} className="label-text text-sm font-medium" />
            )}
            <div className="mt-1.5">{children}</div>
            {hint && !error && (
                <p className="label-text-alt mt-1 text-xs text-base-content/60">{hint}</p>
            )}
            {error && <InputError className="mt-1" message={error} />}
        </div>
    );
}
