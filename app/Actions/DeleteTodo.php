<?php

namespace App\Actions;

use App\Models\Todo;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

class DeleteTodo
{
    public function __invoke(Todo $todo): void
    {
        $userId = $todo->user_id;
        $timezone = $todo->user->timezone;
        $dueDate = $todo->due_date?->toDateString();

        $todo->delete(); // subtasks cascade via FK

        if ($dueDate !== null) {
            TodayResolver::bust($userId, $dueDate);
        }
        TodayResolver::bust($userId, CarbonImmutable::now($timezone)->toDateString());
    }
}
