<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * Updates goal_progress rows when relevant events occur
 * (salah logged, task completed, quran pages logged, etc.).
 */
class GoalProgressService
{
    public function __construct(
        private readonly HijriCalendarService $hijri,
    ) {}

    /**
     * Recalculate progress for all active goals belonging to the user
     * for the period that contains $date.
     */
    public function updateForUser(User $user, CarbonImmutable $date): void
    {
        $goals = Goal::query()
            ->where('user_id', $user->id)
            ->whereDate('starts_on', '<=', $date->toDateString())
            ->where(function ($q) use ($date) {
                $q->whereNull('ends_on')->orWhereDate('ends_on', '>=', $date->toDateString());
            })
            ->get();

        foreach ($goals as $goal) {
            $key = $this->periodKey($goal, $date);
            $value = $this->computeValue($user, $goal, $date);

            $goal->goalProgress()->updateOrCreate(
                ['period_key' => $key],
                ['current_value' => $value],
            );
        }
    }

    /**
     * Generate the period_key for a goal based on its period and period_basis.
     *
     * daily:   '2026-06-12'
     * monthly: '2026-06'
     * yearly:  '2026'
     *
     * When period_basis is hijri, the key is prefixed with 'H',
     * e.g. 'H1447-12-05' (daily), 'H1447-12' (monthly), 'H1447' (yearly).
     */
    public function periodKey(Goal $goal, CarbonImmutable $date): string
    {
        if ($goal->period_basis === 'hijri') {
            $hijri = $this->hijri->hijriDate($date, 0);

            return match ($goal->period) {
                'daily' => sprintf('H%s-%s-%s', $hijri->year, str_pad((string) $hijri->month, 2, '0', STR_PAD_LEFT), str_pad((string) $hijri->day, 2, '0', STR_PAD_LEFT)),
                'monthly' => sprintf('H%s-%s', $hijri->year, str_pad((string) $hijri->month, 2, '0', STR_PAD_LEFT)),
                default => sprintf('H%s', $hijri->year),
            };
        }

        return match ($goal->period) {
            'daily' => $date->toDateString(),
            'monthly' => $date->format('Y-m'),
            default => (string) $date->year,
        };
    }

    /**
     * Compute the current progress value for a goal in its current period.
     */
    private function computeValue(User $user, Goal $goal, CarbonImmutable $date): int
    {
        return match ($goal->metric_source) {
            'routine_completions' => $this->routineCompletions($user, $goal, $date),
            'salah_jamaat' => $this->salahJamaatCount($user, $goal, $date),
            'quran_pages' => $this->quranPages($user, $goal, $date),
            'fasts' => $this->fastsCount($user, $goal, $date),
            default => 0,
        };
    }

    private function routineCompletions(User $user, Goal $goal, CarbonImmutable $date): int
    {
        $routineIds = $goal->linked_routine_ids ?? [];
        if ($routineIds === []) {
            return 0;
        }

        $query = $user->taskInstances()
            ->whereIn('routine_id', $routineIds)
            ->where('status', 'done');

        return match ($goal->period) {
            'daily' => $query->whereDate('due_date', $date->toDateString())->count(),
            'monthly' => $query->whereYear('due_date', $date->year)->whereMonth('due_date', $date->month)->count(),
            default => $query->whereYear('due_date', $date->year)->count(),
        };
    }

    private function salahJamaatCount(User $user, Goal $goal, CarbonImmutable $date): int
    {
        $query = $user->salahLogs()->where('status', 'jamaat');

        return match ($goal->period) {
            'daily' => $query->whereDate('date', $date->toDateString())->count(),
            'monthly' => $query->whereYear('date', $date->year)->whereMonth('date', $date->month)->count(),
            default => $query->whereYear('date', $date->year)->count(),
        };
    }

    private function quranPages(User $user, Goal $goal, CarbonImmutable $date): int
    {
        $query = $user->quranProgress();

        return (int) match ($goal->period) {
            'daily' => $query->whereDate('date', $date->toDateString())->sum('pages_read'),
            'monthly' => $query->whereYear('date', $date->year)->whereMonth('date', $date->month)->sum('pages_read'),
            default => $query->whereYear('date', $date->year)->sum('pages_read'),
        };
    }

    private function fastsCount(User $user, Goal $goal, CarbonImmutable $date): int
    {
        $query = $user->fastingLogs();

        return match ($goal->period) {
            'daily' => $query->whereDate('date', $date->toDateString())->count(),
            'monthly' => $query->whereYear('date', $date->year)->whereMonth('date', $date->month)->count(),
            default => $query->whereYear('date', $date->year)->count(),
        };
    }
}
