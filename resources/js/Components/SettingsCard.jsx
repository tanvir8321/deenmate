export default function SettingsCard({ title, subtitle = null, children, footer = null, className = '' }) {
    return (
        <div className={`card bg-base-100 shadow ${className}`}>
            <div className="card-body p-4 sm:p-5 lg:p-6">
                {title && (
                    <div className="mb-3 lg:mb-4">
                        <h2 className="card-title text-base font-semibold text-base-content sm:text-lg lg:text-xl 2xl:text-2xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                <div className="space-y-3 sm:space-y-4">{children}</div>
            </div>
            {footer && (
                <div className="border-t border-base-300 bg-base-200/40 p-3 sm:p-4 lg:p-6">
                    {footer}
                </div>
            )}
        </div>
    );
}
