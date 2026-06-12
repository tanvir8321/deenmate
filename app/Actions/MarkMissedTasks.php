<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use App\Services\HijriCalendarService;
use App\Services\RecurrenceEngine;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Materializes yesterday's uncompleted reminder-enabled virtual items
 * as missed. Idempotent: the (user_id, routine_id, due_date) unique key
 * plus insertOrIgnore makes re-runs harmless.
 */
class MarkMissedTasks
{
    public function __construct(
        private readonly RecurrenceEngine $recurrence,
        private readonly HijriCalendarService $hijri,
    ) {}

    public function __invoke(User $user, CarbonImmutable $localDate): int
    {
        $localDate = $localDate->startOfDay();
        $hijri = $this->hijri->hijriDate($localDate, $user->hijri_offset);

        $existing = TaskInstance::query()
            ->where('user_id', $user->id)
            ->whereDate('due_date', $localDate->toDateString())
            ->pluck('routine_id')
            ->all();

        $rows = Routine::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->where('reminder_enabled', true)
            ->whereNotIn('id', array_filter($existing))
            ->whereDate('starts_on', '<=', $localDate->toDateString())
            ->where(fn ($q) => $q->whereNull('ends_on')->orWhereDate('ends_on', '>=', $localDate->toDateString()))
            ->get()
            ->filter(function (Routine $routine) use ($localDate, $hijri) {
                $rule = $routine->recurrence;
                if (($rule['freq'] ?? null) === 'interval') {
                    $rule['starts_on'] = $routine->starts_on->toDateString();
                }

                return $this->recurrence->matches($rule, $localDate, $hijri);
            })
            ->map(fn (Routine $routine) => [
                'user_id' => $user->id,
                'routine_id' => $routine->id,
                'title' => $routine->title,
                'due_date' => $localDate->toDateString(),
                'status' => 'missed',
                'created_at' => now('UTC'),
                'updated_at' => now('UTC'),
            ])
            ->values()
            ->all();

        if ($rows !== []) {
            TaskInstance::query()->insertOrIgnore($rows);
            TodayResolver::bust($user->id, $localDate->toDateString());
        }

        return count($rows);
    }
}
