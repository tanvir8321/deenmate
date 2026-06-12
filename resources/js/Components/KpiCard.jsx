const COLOR_MAP = {
    primary:   { value: 'text-primary',   desc: 'text-primary/70'   },
    secondary: { value: 'text-secondary', desc: 'text-secondary/70' },
    accent:    { value: 'text-accent',    desc: 'text-accent/70'    },
    info:      { value: 'text-info',      desc: 'text-info/70'      },
    success:   { value: 'text-success',   desc: 'text-success/70'   },
    warning:   { value: 'text-warning',   desc: 'text-warning/70'   },
    error:     { value: 'text-error',     desc: 'text-error/70'     },
};

export default function KpiCard({ title, value, suffix = '', color = 'primary', sublabel = null }) {
    const c = COLOR_MAP[color] ?? COLOR_MAP.primary;
    return (
        <div className="stat rounded-box bg-base-100 shadow">
            <div className="stat-title text-xs font-medium uppercase tracking-wide text-base-content/60">
                {title}
            </div>
            <div className={`stat-value text-3xl font-bold tabular-nums ${c.value}`}>
                {value}{suffix && <span className="ms-1 text-base font-medium">{suffix}</span>}
            </div>
            {sublabel && <div className={`stat-desc text-xs ${c.desc}`}>{sublabel}</div>}
        </div>
    );
}
