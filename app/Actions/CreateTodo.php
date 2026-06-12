<?php

namespace App\Actions;

use App\Models\Todo;
use App\Models\User;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

class CreateTodo
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(User $user, array $data): Todo
    {
        $todo = Todo::query()->create([
            'user_id' => $user->id,
            'todo_list_id' => $data['todo_list_id'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'due_date' => $data['due_date'] ?? null,
            'due_at' => $data['due_at'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        if ($todo->due_date !== null) {
            TodayResolver::bust($user->id, $todo->due_date->toDateString());
        }
        TodayResolver::bust($user->id, CarbonImmutable::now($user->timezone)->toDateString());

        return $todo;
    }
}
