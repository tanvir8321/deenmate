import { useEffect, useMemo, useState } from 'react';

const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function nextAt(prayerTimes, now) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (const key of PRAYER_KEYS) {
        const t = toMinutes(prayerTimes[key]);
        if (t > nowMin) {
            return { key, isTomorrow: false };
        }
    }
    return { key: 'fajr', isTomorrow: true };
}

function diffSeconds(prayerTimes, now, isTomorrow) {
    const today = startOfDay(now);
    const [h, m] = prayerTimes[isTomorrow ? 'fajr' : 'fajr'].split(':').map(Number);
    const target = new Date(today);
    target.setDate(target.getDate() + (isTomorrow ? 1 : 0));
    target.setHours(h, m, 0, 0);
    return Math.max(0, Math.floor((target - now) / 1000));
}

export default function useNextPrayer(prayerTimes) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (!prayerTimes) return undefined;
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, [prayerTimes]);

    return useMemo(() => {
        if (!prayerTimes) return null;
        const { key, isTomorrow } = nextAt(prayerTimes, now);
        const secondsLeft = diffSeconds(prayerTimes, now, isTomorrow);
        return {
            name: key,
            isTomorrow,
            secondsLeft,
            hhmm: prayerTimes[key],
        };
    }, [prayerTimes, now]);
}
