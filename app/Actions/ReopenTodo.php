<?php

namespace App\Actions;

use App\Models\Todo;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

class ReopenTodo
{
    public function __invoke(Todo $todo): Todo
    {
        $todo->forceFill([
            'status' => 'pending',
            'completed_at' => null,
        ])->save();

        if ($todo->due_date !== null) {
            TodayResolver::bust($todo->user_id, $todo->due_date->toDateString());
        }
        TodayResolver::bust($todo->user_id, CarbonImmutable::now($todo->user->timezone)->toDateString());

        return $todo;
    }
}
