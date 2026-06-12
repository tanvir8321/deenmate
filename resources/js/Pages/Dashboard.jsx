import { Head } from '@inertiajs/react';
import PrayerTimesBar from '@/Components/PrayerTimesBar';
import QuickAddTodo from '@/Components/QuickAddTodo';
import TodayChecklist from '@/Components/TodayChecklist';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

export default function Dashboard({ prayerTimes, hijriDate, hijriEvent, gregorianDate, day }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('Today')}
                </h2>
            }
        >
            <Head title={t('Today')} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <PrayerTimesBar
                        prayerTimes={prayerTimes}
                        hijriDate={hijriDate}
                        gregorianDate={gregorianDate}
                        hijriEvent={hijriEvent}
                    />

                    <div className="rounded-lg bg-white p-4 shadow">
                        <QuickAddTodo />
                    </div>

                    <TodayChecklist day={day} date={gregorianDate} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
