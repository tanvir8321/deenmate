export function Arabesque({ className = '', size = 80 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <g fill="none" stroke="currentColor" strokeWidth="1.25">
                <circle cx="50" cy="50" r="36" />
                <circle cx="50" cy="50" r="24" />
                <path d="M50 14 L62 38 L86 50 L62 62 L50 86 L38 62 L14 50 L38 38 Z" />
                <path d="M50 26 L58 42 L74 50 L58 58 L50 74 L42 58 L26 50 L42 42 Z" />
            </g>
        </svg>
    );
}

export function MashrabiyaPattern({ className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <pattern id="mashrabiya" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path
                        d="M0 0 L48 0 L48 48 L0 48 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.75"
                    />
                    <path
                        d="M0 24 L24 0 M24 48 L48 24 M0 0 L48 48 M0 48 L48 0"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                    />
                    <circle cx="24" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="0.75" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mashrabiya)" />
        </svg>
    );
}

export function CrescentStar({ className = '', size = 32 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M44 8 a24 24 0 1 0 0 48 a18 18 0 1 1 0-48 z"
                fill="currentColor"
            />
            <circle cx="22" cy="14" r="2.5" fill="currentColor" />
            <circle cx="14" cy="22" r="1.5" fill="currentColor" />
        </svg>
    );
}

export function GeometricDivider({ className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-3 text-primary/40 ${className}`} aria-hidden="true">
            <span className="h-px w-16 bg-current opacity-40" />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="h-px w-16 bg-current opacity-40" />
        </div>
    );
}

export function ArchFrame({ className = '', children }) {
    return (
        <div className={`relative ${className}`}>
            <div className="bg-arch h-full w-full overflow-hidden bg-base-200">{children}</div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 520"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M40 520 V200 a160 160 0 0 1 320 0 V520"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary/40"
                />
            </svg>
        </div>
    );
}
