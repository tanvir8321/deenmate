import useTranslation from '@/hooks/useTranslation';
import { GeometricDivider } from './Motifs';

function DashboardMock() {
    return (
        <div className="rounded-box bg-base-100 p-4 text-xs">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-base-content/60">{'\u{1F319}'} Tuesday, 12 Rajab</p>
                    <p className="font-display text-base font-semibold text-base-content">Good morning, Ahmad</p>
                </div>
                <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">3 of 7 done</div>
            </div>
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-base-200 p-2">
                <div className="h-6 w-6 rounded-full bg-secondary/20" />
                <div className="flex-1">
                    <p className="font-medium text-base-content">Fajr in 12 min · 5:08 am</p>
                    <p className="text-[10px] text-base-content/60">Reminder set</p>
                </div>
            </div>
            <ul className="space-y-1.5">
                <li className="flex items-center gap-2 rounded-md bg-base-200 p-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary text-[10px] text-primary-content">✓</span>
                    <span className="text-base-content/60 line-through">Fajr · Jamaat</span>
                </li>
                <li className="flex items-center gap-2 rounded-md bg-base-200 p-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary text-[10px] text-primary-content">✓</span>
                    <span className="text-base-content/60 line-through">Morning Adhkar</span>
                </li>
                <li className="flex items-center gap-2 rounded-md bg-base-200 p-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary text-[10px] text-primary-content">✓</span>
                    <span className="text-base-content/60 line-through">Quran · 2 pages</span>
                </li>
                <li className="flex items-center gap-2 rounded-md p-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-base-300" />
                    <span className="text-base-content">Dhuhr · Asr combined</span>
                </li>
                <li className="flex items-center gap-2 rounded-md p-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-base-300" />
                    <span className="text-base-content">Evening Adhkar</span>
                </li>
            </ul>
        </div>
    );
}

function PhoneMock() {
    return (
        <div className="rounded-box bg-base-100 p-3 text-[11px]">
            <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-base-content">Today</p>
                <div className="h-5 w-5 rounded-full bg-primary/20" />
            </div>
            <div className="mb-2 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 p-2">
                <p className="text-[10px] text-base-content/60">Next prayer</p>
                <p className="font-display text-base font-semibold text-primary">Asr · 4:12 pm</p>
                <p className="text-[10px] text-base-content/60">in 1h 24m</p>
            </div>
            <ul className="space-y-1.5">
                <li className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-primary" />
                    <span className="text-base-content/80">Fajr ✓</span>
                </li>
                <li className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-base-300" />
                    <span>Dhuhr</span>
                </li>
                <li className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-base-300" />
                    <span>Asr</span>
                </li>
                <li className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-base-300" />
                    <span>Maghrib</span>
                </li>
                <li className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-base-300" />
                    <span>Isha</span>
                </li>
            </ul>
        </div>
    );
}

export default function AppPreview() {
    const { t } = useTranslation();

    return (
        <section className="bg-base-200 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-bold text-base-content sm:text-4xl">
                        {t('Landing.AppPreviewTitle')}
                    </h2>
                    <p className="mt-3 text-base text-base-content/70">
                        {t('Landing.AppPreviewSub')}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-end">
                    <div className="w-full max-w-xl">
                        <div className="rounded-2xl border-[10px] border-base-content/80 bg-base-300 p-1 shadow-2xl">
                            <div className="mb-1 flex items-center gap-1 px-2 pt-1">
                                <span className="h-2 w-2 rounded-full bg-error/70" />
                                <span className="h-2 w-2 rounded-full bg-warning/70" />
                                <span className="h-2 w-2 rounded-full bg-success/70" />
                                <div className="ms-2 h-3 flex-1 rounded bg-base-100/60" />
                            </div>
                            <div className="rounded-lg bg-base-100">
                                <DashboardMock />
                            </div>
                        </div>
                    </div>

                    <div className="w-48 sm:w-56">
                        <div className="rounded-[2rem] border-[8px] border-base-content/80 bg-base-300 p-1 shadow-2xl">
                            <div className="overflow-hidden rounded-[1.5rem] bg-base-100">
                                <PhoneMock />
                            </div>
                        </div>
                    </div>
                </div>

                <GeometricDivider className="mt-12" />
            </div>
        </section>
    );
}
