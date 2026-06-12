export default function ResponsiveGrid({
    cols = { base: 1, sm: 2, lg: 3 },
    gap = 'gap-3 sm:gap-4 lg:gap-6',
    className = '',
    children,
}) {
    const cls = [
        'grid',
        `grid-cols-${cols.base ?? 1}`,
        cols.sm ? `sm:grid-cols-${cols.sm}` : '',
        cols.lg ? `lg:grid-cols-${cols.lg}` : '',
        cols.xl ? `xl:grid-cols-${cols.xl}` : '',
        cols['2xl'] ? `2xl:grid-cols-${cols['2xl']}` : '',
        cols['3xl'] ? `3xl:grid-cols-${cols['3xl']}` : '',
        cols['4xl'] ? `4xl:grid-cols-${cols['4xl']}` : '',
        gap,
        className,
    ].filter(Boolean).join(' ');

    return <div className={cls}>{children}</div>;
}
