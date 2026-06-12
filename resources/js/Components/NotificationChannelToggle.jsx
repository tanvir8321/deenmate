export default function NotificationChannelToggle({ label, description, value, onChange, disabled = false }) {
    return (
        <label
            className={`flex items-start gap-3 rounded-lg border border-base-300 p-3 transition hover:border-primary ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
        >
            <input
                type="checkbox"
                className="toggle toggle-primary mt-1 shrink-0"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                aria-label={label}
            />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-base-content">{label}</p>
                {description && (
                    <p className="mt-0.5 text-xs text-base-content/60">{description}</p>
                )}
            </div>
        </label>
    );
}
