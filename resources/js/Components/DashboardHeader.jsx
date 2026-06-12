import HijriBadge from '@/Components/HijriBadge';

export default function DashboardHeader({ title, hijriDate, gregorianDate, hijriEvent, hasLocation }) {
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body flex-row flex-wrap items-center justify-between gap-3 p-4">
                <h1 className="text-2xl font-bold text-base-content">{title}</h1>
                <HijriBadge
                    hijriDate={hijriDate}
                    gregorianDate={gregorianDate}
                    event={hijriEvent}
                />
                {!hasLocation && (
                    <span className="badge badge-warning gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        No location
                    </span>
                )}
            </div>
        </div>
    );
}
