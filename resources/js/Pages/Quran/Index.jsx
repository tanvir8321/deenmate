import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
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
      header={<h2 className="text-xl font-semibold text-base-content">{t('Quran')}</h2>}
    >
      <Head title={t('Quran')} />

      <Container className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat card bg-base-100 shadow">
              <div className="stat-title text-base-content/60">{t('Today')}</div>
              <div className="stat-value text-3xl text-base-content">
                {today?.pages_read || 0}
              </div>
              <div className="stat-desc text-base-content/50">{t('pages')}</div>
            </div>
            <div className="stat card bg-base-100 shadow">
              <div className="stat-title text-base-content/60">{t('This month')}</div>
              <div className="stat-value text-3xl text-base-content">
                {monthly_total}
              </div>
              <div className="stat-desc text-base-content/50">{t('of')} {khatm_total} {t('pages')}</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body p-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-base-content/60">{t('Khatm progress')}</span>
                <span className="font-medium text-base-content">{percent}%</span>
              </div>
              <progress className="progress progress-primary" value={percent} max="100" />
            </div>
          </div>

          <form onSubmit={submit} className="card bg-base-100 shadow">
            <div className="card-body space-y-4 p-5">
              <h3 className="text-lg font-medium text-base-content">{t('Log reading')}</h3>
              <div className="form-control w-full">
                <label className="label-text mb-1 text-sm font-medium text-base-content">{t('Pages read')}</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={data.pages_read}
                  onChange={(e) => setData('pages_read', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label-text mb-1 text-sm font-medium text-base-content">{t('From')}</label>
                  <input
                    type="text"
                    placeholder="1:1"
                    value={data.from_ref}
                    onChange={(e) => setData('from_ref', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label-text mb-1 text-sm font-medium text-base-content">{t('To')}</label>
                  <input
                    type="text"
                    placeholder="2:286"
                    value={data.to_ref}
                    onChange={(e) => setData('to_ref', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary w-full"
              >
                {processing ? t('Saving...') : t('Save')}
              </button>
            </div>
          </form>

          {recent_readings?.length > 0 && (
            <div className="card bg-base-100 shadow">
              <div className="card-body p-5">
                <h3 className="text-lg font-medium text-base-content mb-3">{t('Recent readings')}</h3>
                <div className="divide-y divide-base-300">
                  {recent_readings.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <span className="text-sm text-base-content/70">{r.date}</span>
                      <span className="text-sm font-medium text-base-content">
                        {r.pages_read} {t('pages')}
                        {r.from_ref && ` (${r.from_ref}—${r.to_ref})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </Container>
    </AuthenticatedLayout>
  );
}
