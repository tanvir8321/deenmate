import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
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
  ramadan: 'bg-warning/15 text-warning border-warning/30',
  monday_thursday: 'bg-success/15 text-success border-success/30',
  ayyam_beedh: 'bg-info/15 text-info border-info/30',
  qada: 'bg-error/15 text-error border-error/30',
  nafl: 'bg-secondary/15 text-secondary border-secondary/30',
  arafah: 'bg-warning/15 text-warning border-warning/30',
  ashura: 'bg-warning/15 text-warning border-warning/30',
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
      header={<h2 className="text-xl font-semibold text-base-content">{t('Fasting')}</h2>}
    >
      <Head title={t('Fasting')} />

      <Container className="space-y-4 py-2">
          {is_ramadan && (
            <div className="alert alert-warning">
              <div>
                <p className="text-base font-semibold">
                  {t('Ramadan')} — {hijri_date}
                </p>
                <p className="text-sm opacity-80">{t('Ramadan mode active')}</p>
              </div>
            </div>
          )}

          {qada && (
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <h3 className="text-sm font-medium text-base-content/60">{t('Qada counter')}</h3>
                <p className="text-2xl font-bold text-base-content">
                  {qada.owed - qada.repaid > 0 ? qada.owed - qada.repaid : 0}
                  <span className="text-sm font-normal text-base-content/60"> {t('fasts remaining')}</span>
                </p>
              </div>
            </div>
          )}

          {today_fast && (
            <div className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <h3 className="text-sm font-medium text-base-content/60">{t("Today's fast")}</h3>
                <span className={`badge mt-1 ${TYPE_COLORS[today_fast.type] || 'badge-neutral'}`}>
                  {t(today_fast.type)}
                </span>
                <span className="ms-2 text-sm text-base-content/70">
                  — {t(today_fast.status)}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="card bg-base-100 shadow">
            <div className="card-body space-y-4 p-5">
              <h3 className="text-lg font-medium text-base-content">{t('Log fast')}</h3>
              <div className="flex flex-wrap gap-2">
                {FAST_TYPES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setData('type', key)}
                    className={`btn btn-sm ${data.type === key ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['completed', 'broken', 'intended'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setData('status', s)}
                    className={`btn btn-sm ${data.status === s ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {t(s)}
                  </button>
                ))}
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

          <div className="card bg-base-100 shadow">
            <div className="card-body p-5">
              <h3 className="text-lg font-medium text-base-content mb-4">{t('This month')}</h3>
              <div className="grid grid-cols-7 gap-1">
                {monthly_days.map(({ day, date, type, status }) => (
                  <div
                    key={date}
                    className={`flex h-10 items-center justify-center rounded text-xs font-medium border ${
                      type ? TYPE_COLORS[type] : 'border-base-300 bg-base-200 text-base-content/40'
                    }`}
                    title={type ? `${t(type)} — ${t(status || '')}` : ''}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
      </Container>
    </AuthenticatedLayout>
  );
}
