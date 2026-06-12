import { Head } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

const PRESETS = [33, 100];

export default function Index() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [customTarget, setCustomTarget] = useState('');
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    if (navigator.vibrate) navigator.vibrate(30);
  }, []);

  const reset = useCallback(() => {
    if (count > 0) {
      setSessions((prev) => [...prev, { target, count, date: new Date().toISOString() }]);
    }
    setCount(0);
  }, [count, target]);

  const saveDhikr = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(route('dhikr-sessions.store'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({
          slug: `tasbih_${Date.now()}`,
          count,
          target,
          date: new Date().toISOString().split('T')[0],
        }),
      });
      setCount(0);
    } finally {
      setSaving(false);
    }
  }, [count, target]);

  const setPreset = (n) => {
    setTarget(n);
    setCount(0);
    setSessions([]);
  };

  const setCustom = () => {
    const n = parseInt(customTarget, 10);
    if (n > 0) {
      setTarget(n);
      setCount(0);
      setSessions([]);
      setCustomTarget('');
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tap]);

  const complete = count >= target && target > 0;

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-base-content">{t('Tasbih')}</h2>}
    >
      <Head title={t('Tasbih')} />

      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="mb-8 flex gap-2">
          {PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setPreset(n)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                target === n
                  ? 'bg-primary text-base-content'
                  : 'bg-base-200 text-base-content/80 hover:bg-base-300'
              }`}
            >
              {n}
            </button>
          ))}
          <div className="flex gap-1">
            <input
              type="number"
              min="1"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setCustom()}
              placeholder={t('Custom')}
              className="w-20 rounded-full border-base-300 px-3 py-2 text-sm"
            />
            <button
              onClick={setCustom}
              className="rounded-full bg-base-200 px-3 py-2 text-sm font-medium text-base-content/80 hover:bg-base-300"
            >
              {t('Set')}
            </button>
          </div>
        </div>

        <button
          onClick={tap}
          className={`mb-4 flex h-48 w-48 items-center justify-center rounded-full transition-all active:scale-95 select-none cursor-pointer ${
            complete
              ? 'bg-success/15 text-success ring-4 ring-success/30'
              : 'bg-base-100 text-base-content shadow-xl hover:shadow-2xl'
          }`}
          aria-label={t('Tap to count')}
        >
          <div className="text-center">
            <span className="text-5xl font-bold">{count}</span>
            <p className="mt-1 text-sm text-base-content/50">
              / {target}
            </p>
          </div>
        </button>

        <p className="mb-6 text-center text-sm text-base-content/60">
          {complete
            ? t('Complete!')
            : t('Tap the circle or press spacebar')}
        </p>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="rounded-lg border border-base-300 px-5 py-2 text-sm font-medium text-base-content/80 hover:bg-base-200"
          >
            {t('Reset')}
          </button>
          {count > 0 && (
            <button
              onClick={saveDhikr}
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-base-content hover:bg-primary disabled:opacity-50"
            >
              {saving ? t('Saving...') : t('Save session')}
            </button>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="mt-8 w-full max-w-xs space-y-1">
            <p className="text-xs font-medium text-base-content/60 mb-2">{t('This session')}</p>
            {sessions.map((s, i) => (
              <div key={i} className="flex justify-between text-sm text-base-content/70">
                <span>{s.count}/{s.target}</span>
                <span>{new Date(s.date).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
