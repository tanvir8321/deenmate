import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

const FAST_TYPES = [
  { key: 'ramadan', label: 'Ramadan' },
  { key: 'monday_thursday', label: 'Mon/Thu' },
  { key: 'ayyam_beedh', label: 'Ayyam al-Beedh' },
  { key: 'qada', label: 'Qada' },
  { key: 'nafl', label: 'Nafl' },
  { key: 'arafah', label: 'Arafah' },
  { key: 'ashura', label: 'Ashura' },
];

const TYPE_COLORS = {
  ramadan: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  monday_thursday: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  ayyam_beedh: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  qada: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  nafl: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  arafah: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  ashura: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
};

export default function Index({ today_fast, monthly_days, qada, is_ramadan, hijri_date }) {
  const { t } = useTranslation();
  const { data, setData, post, processing } = useForm({
    date: new Date().toISOString().split('T')[0],
    type: 'ramadan',
    status: 'completed',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('fasting.store'), { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('Fasting')}</h2>}
    >
      <Head title={t('Fasting')} />

      <div className="py-6">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8 space-y-6">
          {is_ramadan && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
              <p className="text-lg font-semibold text-amber-800 dark:text-amber-400">
                {t('Ramadan')} — {hijri_date}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500">{t('Ramadan mode active')}</p>
            </div>
          )}

          {qada && (
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Qada counter')}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {qada.owed - qada.repaid > 0 ? qada.owed - qada.repaid : 0}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> {t('fasts remaining')}</span>
              </p>
            </div>
          )}

          {today_fast && (
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("Today's fast")}</h3>
              <span className={`inline-block mt-1 rounded-full px-3 py-1 text-sm font-medium ${TYPE_COLORS[today_fast.type] || ''}`}>
                {t(today_fast.type)}
              </span>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                — {t(today_fast.status)}
              </span>
            </div>
          )}

          <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('Log fast')}</h3>
            <div className="flex flex-wrap gap-2">
              {FAST_TYPES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setData('type', key)}
                  className={`rounded-full px-3 py-1 text-sm font-medium border transition ${
                    data.type === key ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t(label)}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              {['completed', 'broken', 'intended'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setData('status', s)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    data.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t(s)}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {processing ? t('Saving...') : t('Save')}
            </button>
          </form>

          <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('This month')}</h3>
            <div className="grid grid-cols-7 gap-1">
              {monthly_days.map(({ day, date, type, status }) => (
                <div
                  key={date}
                  className={`flex h-10 items-center justify-center rounded text-xs font-medium ${
                    type ? TYPE_COLORS[type]?.replace('100', '50').replace('/30', '/20') || 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-100 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                  title={type ? `${t(type)} — ${t(status || '')}` : ''}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
