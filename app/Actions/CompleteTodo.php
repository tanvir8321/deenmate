<?php

namespace App\Actions;

use App\Models\Todo;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Marks a todo done. Completing a subtask never completes its parent.
 */
class CompleteTodo
{
    public function __invoke(Todo $todo): Todo
    {
        if ($todo->status !== 'done') {
            $todo->forceFill([
                'status' => 'done',
                'completed_at' => CarbonImmutable::now('UTC'),
            ])->save();
        }

        if ($todo->due_date !== null) {
            TodayResolver::bust($todo->user_id, $todo->due_date->toDateString());
        }
        TodayResolver::bust($todo->user_id, CarbonImmutable::now($todo->user->timezone)->toDateString());

        return $todo;
    }
}
