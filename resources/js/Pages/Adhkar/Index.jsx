import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{t('Adhkar')}</h2>}
    >
      <Head title={t('Adhkar')} />

      <div className="py-6">
        <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto">
            {Object.keys(CATEGORY_LABELS).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
                <div key={adhkar.id} className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                  <p className="mb-3 text-right text-2xl leading-relaxed font-arabic text-gray-900 dark:text-gray-100" dir="rtl">
                    {adhkar.arabic}
                  </p>
                  {adhkar.transliteration && (
                    <p className="mb-2 text-sm italic text-gray-500">{adhkar.transliteration}</p>
                  )}
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {adhkar.translations?.en || adhkar.translations?.bn}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
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
                          ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
                      }`}
                      aria-label={`Count ${adhkar.id}`}
                    >
                      {done}/{adhkar.count}
                    </button>
                    {done > 0 && !completed && (
                      <button
                        onClick={() => saveSession(adhkar)}
                        className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        {t('Save')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
