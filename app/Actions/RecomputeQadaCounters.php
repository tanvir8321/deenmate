<?php

namespace App\Actions;

use App\Models\SalahLog;
use App\Models\User;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Recompute qada_counters rows from raw logs. Idempotent — re-running
 * produces the same owed values because they're a count of `missed`
 * status rows in `salah_logs` (and `broken` in `fasting_logs`).
 *
 * `repaid` is left untouched (it was set by user actions on the
 * Salah page / Fasting page).
 */
class RecomputeQadaCounters
{
    public function __construct(
        private readonly SalahAnalyticsService $analytics,
    ) {}

    /**
     * @return array{updated: int, rows: array<int, array{kind: string, owed: int, repaid: int}>}
     */
    public function __invoke(User $user, ?CarbonImmutable $today = null): array
    {
        $today = $today ?? CarbonImmutable::now($user->timezone)->startOfDay();

        $salahOwed = SalahLog::query()
            ->where('user_id', $user->id)
            ->where('status', 'missed')
            ->selectRaw('prayer, COUNT(*) as c')
            ->groupBy('prayer')
            ->pluck('c', 'prayer');

        $counts = [];
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $counts['salah_'.$p] = (int) ($salahOwed[$p] ?? 0);
        }

        $fastOwed = (int) $user->fastingLogs()
            ->where('status', 'broken')
            ->count();
        $counts['fast'] = $fastOwed;

        $rows = [];
        DB::transaction(function () use ($user, $counts, &$rows) {
            foreach ($counts as $kind => $owed) {
                $counter = $user->qadaCounters()->where('kind', $kind)->first();
                $repaid = (int) ($counter->repaid ?? 0);
                $user->qadaCounters()->updateOrCreate(
                    ['kind' => $kind],
                    [
                        'owed' => $owed,
                        'repaid' => $repaid,
                    ],
                );
                $rows[] = ['kind' => $kind, 'owed' => $owed, 'repaid' => $repaid];
            }
        });

        $this->analytics::bust($user->id, $today);

        return ['updated' => count($rows), 'rows' => $rows];
    }
}
