<?php

namespace App\Actions;

use App\Models\Todo;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

class UpdateTodo
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(Todo $todo, array $data): Todo
    {
        $oldDate = $todo->due_date?->toDateString();

        $todo->fill($data)->save();

        foreach (array_filter([$oldDate, $todo->due_date?->toDateString()]) as $date) {
            TodayResolver::bust($todo->user_id, $date);
        }
        TodayResolver::bust($todo->user_id, CarbonImmutable::now($todo->user->timezone)->toDateString());

        return $todo->refresh();
    }
}
