export default function PageHeader({ title, subtitle, actions = null, badge = null }) {
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold text-base-content sm:text-2xl lg:text-3xl 2xl:text-4xl">
                            {title}
                        </h1>
                        {badge}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-sm text-base-content/60 sm:text-base">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
        </div>
    );
}
