<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

/**
 * Salah analytics — aggregates over `salah_logs` for the dashboard widget,
 * the /salah page analytics, and the Reports page (single source of truth
 * so the dashboard and reports can never disagree, per CLAUDE.md rules).
 *
 * Cached per (user, scope, dateRange). `LogSalah` and `RepayQada` bust
 * the relevant keys so updates appear on the next request.
 */
class SalahAnalyticsService
{
    public const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    public const SALAH_KINDS = [
        'salah_fajr',
        'salah_dhuhr',
        'salah_asr',
        'salah_maghrib',
        'salah_isha',
    ];

    public function __construct() {}

    /**
     * @return array{jamaat: int, alone: int, qada: int, missed: int}
     */
    public function breakdown(User $user, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $key = $this->cacheKey($user->id, 'breakdown', $from->toDateString().':'.$to->toDateString());

        return Cache::remember(
            $key,
            $to->endOfDay(),
            function () use ($user, $from, $to) {
                $counts = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0];
                $rows = $user->salahLogs()
                    ->whereDate('date', '>=', $from->toDateString())
                    ->whereDate('date', '<=', $to->toDateString())
                    ->selectRaw('status, COUNT(*) as c')
                    ->groupBy('status')
                    ->pluck('c', 'status');

                foreach ($counts as $status => $_) {
                    $counts[$status] = (int) ($rows[$status] ?? 0);
                }

                return $counts;
            },
        );
    }

    /**
     * 90-day heatmap: each row is one Gregorian day, `value` = number of
     * prayers with status in (jamaat, alone) that day. 0 means nothing
     * recorded OR all rows were qada/missed.
     *
     * @return array<int, array{date: string, value: int}>
     */
    public function heatmap(User $user, int $days = 90, ?CarbonImmutable $today = null): array
    {
        $today = ($today ?? CarbonImmutable::now($user->timezone))->startOfDay();
        $from = $today->subDays($days - 1);
        $key = $this->cacheKey($user->id, 'heatmap', $days.':'.$today->toDateString());

        return Cache::remember(
            $key,
            $today->endOfDay(),
            function () use ($user, $from, $today, $days) {
                $rows = $user->salahLogs()
                    ->whereDate('date', '>=', $from->toDateString())
                    ->whereDate('date', '<=', $today->toDateString())
                    ->whereIn('status', ['jamaat', 'alone'])
                    ->selectRaw('date, COUNT(*) as c')
                    ->groupBy('date')
                    ->get();

                $byDate = [];
                foreach ($rows as $row) {
                    $byDate[CarbonImmutable::parse($row->date)->toDateString()] = (int) $row->c;
                }

                $out = [];
                for ($i = $days - 1; $i >= 0; $i--) {
                    $date = $today->subDays($i)->toDateString();
                    $out[] = ['date' => $date, 'value' => $byDate[$date] ?? 0];
                }

                return $out;
            },
        );
    }

    /**
     * Current streak: consecutive days ending at $today where the user
     * has 5 salah_logs with status in (jamaat, alone). 5/5 on time.
     */
    public function currentStreak(User $user, CarbonImmutable $today): int
    {
        $key = $this->cacheKey($user->id, 'streak', $today->toDateString());

        return Cache::remember(
            $key,
            $today->endOfDay(),
            function () use ($user, $today) {
                $streak = 0;
                $cursor = $today->startOfDay();

                while (true) {
                    $completed = $user->salahLogs()
                        ->whereDate('date', $cursor->toDateString())
                        ->whereIn('status', ['jamaat', 'alone'])
                        ->count();

                    if ($completed >= 5) {
                        $streak++;
                        $cursor = $cursor->subDay();
                    } else {
                        break;
                    }
                }

                return $streak;
            },
        );
    }

    /**
     * Per-prayer consistency over a range. `pct` = (jamaat+alone) / total
     * rows for that prayer in the range (i.e. how often each prayer was
     * prayed on time when it was attempted).
     *
     * @return array<string, array{jamaat: int, alone: int, qada: int, missed: int, pct: float, recorded: int}>
     */
    public function perPrayerConsistency(User $user, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $key = $this->cacheKey($user->id, 'per_prayer', $from->toDateString().':'.$to->toDateString());

        return Cache::remember(
            $key,
            $to->endOfDay(),
            function () use ($user, $from, $to) {
                $rows = $user->salahLogs()
                    ->whereDate('date', '>=', $from->toDateString())
                    ->whereDate('date', '<=', $to->toDateString())
                    ->selectRaw('prayer, status, COUNT(*) as c')
                    ->groupBy('prayer', 'status')
                    ->get();

                $buckets = [];
                foreach (self::PRAYERS as $p) {
                    $buckets[$p] = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0, 'pct' => 0.0, 'recorded' => 0];
                }
                foreach ($rows as $r) {
                    if (! isset($buckets[$r->prayer])) {
                        continue;
                    }
                    $buckets[$r->prayer][$r->status] = (int) $r->c;
                }
                foreach ($buckets as $p => &$b) {
                    $b['recorded'] = $b['jamaat'] + $b['alone'] + $b['qada'] + $b['missed'];
                    $b['pct'] = $b['recorded'] > 0
                        ? round((($b['jamaat'] + $b['alone']) / $b['recorded']) * 100, 1)
                        : 0.0;
                }

                return $buckets;
            },
        );
    }

    /**
     * Monthly breakdown — last N Gregorian months, including the current one.
     *
     * @return array<int, array{month: string, label: string, jamaat: int, alone: int, qada: int, missed: int}>
     */
    public function monthlyBreakdown(User $user, int $months = 6, ?CarbonImmutable $today = null): array
    {
        $today = ($today ?? CarbonImmutable::now($user->timezone))->startOfMonth();
        $key = $this->cacheKey($user->id, 'monthly', $months.':'.$today->toDateString());

        return Cache::remember(
            $key,
            $today->endOfMonth(),
            function () use ($user, $today, $months) {
                $out = [];
                for ($i = $months - 1; $i >= 0; $i--) {
                    $monthStart = $today->subMonths($i)->startOfMonth();
                    $monthEnd = $monthStart->endOfMonth();
                    $breakdown = $this->breakdown($user, $monthStart, $monthEnd);
                    $out[] = [
                        'month' => $monthStart->format('Y-m'),
                        'label' => $monthStart->translatedFormat('M Y'),
                        ...$breakdown,
                    ];
                }

                return $out;
            },
        );
    }

    public static function cacheKey(int $userId, string $scope, string $range): string
    {
        return "salah_analytics:{$userId}:{$scope}:{$range}";
    }

    /**
     * Bust analytics for a user around a specific date — used by LogSalah
     * and RepayQada. We forget today + yesterday + the 90-day heatmap range
     * so any in-flight widget rendering reflects the change.
     */
    public static function bust(int $userId, CarbonImmutable $date): void
    {
        $today = $date->toDateString();
        $yesterday = $date->subDay()->toDateString();
        Cache::forget(self::cacheKey($userId, 'breakdown', $yesterday.':'.$today));
        Cache::forget(self::cacheKey($userId, 'heatmap', '90:'.$today));
        Cache::forget(self::cacheKey($userId, 'heatmap', '180:'.$today));
        Cache::forget(self::cacheKey($userId, 'streak', $today));
        Cache::forget(self::cacheKey($userId, 'streak', $yesterday));
        Cache::forget(self::cacheKey($userId, 'per_prayer', $yesterday.':'.$today));
        Cache::forget(self::cacheKey($userId, 'monthly', '6:'.$date->startOfMonth()->toDateString()));
    }
}
