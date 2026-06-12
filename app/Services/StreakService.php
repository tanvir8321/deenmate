<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

/**
 * Streaks are derived from completed task_instances (status=done),
 * cached per user per day; rollover busts the cache.
 */
class StreakService
{
    /**
     * @return array{current: int, longest: int}
     */
    public function global(User $user, CarbonImmutable $localToday): array
    {
        return Cache::remember(
            self::cacheKey($user->id, $localToday->toDateString()),
            $localToday->endOfDay(),
            fn () => $this->compute($this->doneDates($user), $localToday),
        );
    }

    /**
     * @return array{current: int, longest: int}
     */
    public function forRoutine(User $user, int $routineId, CarbonImmutable $localToday): array
    {
        return $this->compute($this->doneDates($user, $routineId), $localToday);
    }

    public static function cacheKey(int $userId, string $date): string
    {
        return "streak:{$userId}:{$date}";
    }

    public static function bust(int $userId, string $date): void
    {
        Cache::forget(self::cacheKey($userId, $date));
    }

    /**
     * @return list<string> distinct done dates, descending
     */
    private function doneDates(User $user, ?int $routineId = null): array
    {
        return $user->taskInstances()
            ->where('status', 'done')
            ->when($routineId !== null, fn ($q) => $q->where('routine_id', $routineId))
            ->orderByDesc('due_date')
            ->distinct()
            ->pluck('due_date')
            ->map(fn ($d) => CarbonImmutable::parse($d)->toDateString())
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  list<string>  $dates  descending distinct dates
     * @return array{current: int, longest: int}
     */
    private function compute(array $dates, CarbonImmutable $localToday): array
    {
        if ($dates === []) {
            return ['current' => 0, 'longest' => 0];
        }

        // Current: consecutive run ending today or yesterday (today not yet over).
        $current = 0;
        $cursor = $localToday->startOfDay();
        if ($dates[0] !== $cursor->toDateString()) {
            $cursor = $cursor->subDay();
        }
        foreach ($dates as $date) {
            if ($date === $cursor->toDateString()) {
                $current++;
                $cursor = $cursor->subDay();
            } elseif ($date < $cursor->toDateString()) {
                break;
            }
        }

        // Longest: scan all runs.
        $longest = 1;
        $run = 1;
        for ($i = 1, $n = count($dates); $i < $n; $i++) {
            $expected = CarbonImmutable::parse($dates[$i - 1])->subDay()->toDateString();
            $run = $dates[$i] === $expected ? $run + 1 : 1;
            $longest = max($longest, $run);
        }

        return ['current' => $current, 'longest' => max($longest, $current)];
    }
}
