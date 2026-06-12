<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\Todo;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Turns a repeating todo into a proper routine; the todo is cancelled
 * so it no longer competes with the routine-generated checklist.
 */
class ConvertTodoToRoutine
{
    /**
     * @param  array<string, mixed>  $recurrence
     */
    public function __invoke(Todo $todo, array $recurrence, ?string $fixedTime = null): Routine
    {
        $startsOn = $todo->due_date?->toDateString()
            ?? CarbonImmutable::now($todo->user->timezone)->toDateString();

        $routine = Routine::query()->create([
            'user_id' => $todo->user_id,
            'title' => $todo->title,
            'category' => 'general',
            'recurrence' => $recurrence,
            'fixed_time' => $fixedTime,
            'starts_on' => $startsOn,
            'is_active' => true,
        ]);

        $todo->forceFill(['status' => 'cancelled'])->save();

        if ($todo->due_date !== null) {
            TodayResolver::bust($todo->user_id, $todo->due_date->toDateString());
        }
        TodayResolver::bust($todo->user_id, CarbonImmutable::now($todo->user->timezone)->toDateString());

        return $routine;
    }
}
