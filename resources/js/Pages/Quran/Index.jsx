import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

export default function Index({ today, monthly_total, khatm_total, recent_readings }) {
  const { t } = useTranslation();
  const { data, setData, post, processing } = useForm({
    date: new Date().toISOString().split('T')[0],
    pages_read: '',
    from_ref: '',
    to_ref: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('quran.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setData('pages_read', '');
        setData('from_ref', '');
        setData('to_ref', '');
      },
    });
  };

  const percent = Math.min(100, Math.round((monthly_total / khatm_total) * 100));

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('Quran')}</h2>}
    >
      <Head title={t('Quran')} />

      <div className="py-6">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Today')}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {today?.pages_read || 0}
              </p>
              <p className="text-xs text-gray-400">{t('pages')}</p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('This month')}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">
                {monthly_total}
              </p>
              <p className="text-xs text-gray-400">{t('of')} {khatm_total} {t('pages')}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('Khatm progress')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{percent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-3 rounded-full bg-emerald-600 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('Log reading')}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Pages read')}</label>
              <input
                type="number"
                min="1"
                required
                value={data.pages_read}
                onChange={(e) => setData('pages_read', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('From')}</label>
                <input
                  type="text"
                  placeholder="1:1"
                  value={data.from_ref}
                  onChange={(e) => setData('from_ref', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('To')}</label>
                <input
                  type="text"
                  placeholder="2:286"
                  value={data.to_ref}
                  onChange={(e) => setData('to_ref', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {processing ? t('Saving...') : t('Save')}
            </button>
          </form>

          {recent_readings?.length > 0 && (
            <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">{t('Recent readings')}</h3>
              <div className="space-y-2">
                {recent_readings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{r.date}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {r.pages_read} {t('pages')}
                      {r.from_ref && ` (${r.from_ref}—${r.to_ref})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
