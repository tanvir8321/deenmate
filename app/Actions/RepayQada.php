<?php

namespace App\Actions;

use App\Models\QadaCounter;
use App\Models\User;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;

/**
 * Atomically increment the `repaid` counter for a single qada kind.
 * Capped at `owed`. Idempotent: calling with the cap reached returns
 * the same row unchanged.
 */
class RepayQada
{
    public function __construct(
        private readonly SalahAnalyticsService $analytics,
    ) {}

    public function __invoke(User $user, string $kind, int $count = 1): QadaCounter
    {
        $counter = $user->qadaCounters()->where('kind', $kind)->first();

        if ($counter === null) {
            $counter = $user->qadaCounters()->create([
                'kind' => $kind,
                'owed' => 0,
                'repaid' => 0,
            ]);
        }

        $room = max(0, $counter->owed - $counter->repaid);
        $delta = max(0, min($count, $room));

        if ($delta > 0) {
            $counter->increment('repaid', $delta);
        }

        $this->analytics::bust($user->id, CarbonImmutable::now($user->timezone));

        return $counter->refresh();
    }
}
