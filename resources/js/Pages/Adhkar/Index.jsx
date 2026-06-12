import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import useTranslation from '@/hooks/useTranslation';

const CATEGORY_LABELS = {
  morning: 'Morning Adhkar',
  evening: 'Evening Adhkar',
  post_salah: 'Post-Salah',
};

export default function Index({ groups }) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('morning');
  const [counters, setCounters] = useState({});
  const { post } = useForm({});

  const increment = (id, max) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const saveSession = (adhkar) => {
    const count = counters[adhkar.id] || adhkar.done || 0;
    post(route('dhikr-sessions.store'), {
      slug: adhkar.id,
      count,
      target: adhkar.count,
      date: new Date().toISOString().split('T')[0],
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setCounters((prev) => ({ ...prev, [adhkar.id]: 0 }));
      },
    });
  };

  const items = groups[activeCategory] || [];

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-base-content">{t('Adhkar')}</h2>}
    >
      <Head title={t('Adhkar')} />

      <Container className="py-2">
        <div className="mb-4 flex gap-2 overflow-x-auto sm:mb-6">
            {Object.keys(CATEGORY_LABELS).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content/80 hover:bg-base-300'
                }`}
              >
                {t(CATEGORY_LABELS[cat])}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {items.map((adhkar) => {
              const done = (counters[adhkar.id] || 0) + (adhkar.done || 0);
              const completed = adhkar.completed || done >= adhkar.count;

              return (
                <div key={adhkar.id} className="card bg-base-100 shadow">
                  <div className="card-body p-5">
                  <p className="mb-3 text-right text-2xl leading-relaxed font-arabic text-base-content" dir="rtl">
                    {adhkar.arabic}
                  </p>
                  {adhkar.transliteration && (
                    <p className="mb-2 text-sm italic text-base-content/60">{adhkar.transliteration}</p>
                  )}
                  <p className="mb-3 text-sm text-base-content/70">
                    {adhkar.translations?.en || adhkar.translations?.bn}
                  </p>
                  <div className="flex items-center justify-between text-xs text-base-content/50">
                    <span>{adhkar.source}</span>
                    <span>
                      x{adhkar.count}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => increment(adhkar.id, adhkar.count)}
                      disabled={completed}
                      className={`flex-1 rounded-lg border px-4 py-3 text-center text-lg font-semibold transition ${
                        completed
                          ? 'border-success/30 bg-success/10 text-success'
                          : 'border-base-300 bg-base-200 text-base-content hover:bg-base-300 active:scale-95'
                      }`}
                      aria-label={`Count ${adhkar.id}`}
                    >
                      {done}/{adhkar.count}
                    </button>
                    {done > 0 && !completed && (
                      <button
                        onClick={() => saveSession(adhkar)}
                        className="btn btn-primary"
                      >
                        {t('Save')}
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
      </Container>
    </AuthenticatedLayout>
  );
}
