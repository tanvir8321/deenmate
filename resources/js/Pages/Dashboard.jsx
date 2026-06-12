import { Head } from '@inertiajs/react';
import PrayerTimesBar from '@/Components/PrayerTimesBar';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

export default function Dashboard({ prayerTimes, hijriDate, hijriEvent, gregorianDate }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('Dashboard')}
                </h2>
            }
        >
            <Head title={t('Dashboard')} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <PrayerTimesBar
                        prayerTimes={prayerTimes}
                        hijriDate={hijriDate}
                        gregorianDate={gregorianDate}
                        hijriEvent={hijriEvent}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
