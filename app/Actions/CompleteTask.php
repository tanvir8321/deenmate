<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Materializes a virtual routine instance as done — idempotent upsert
 * on (user_id, routine_id, due_date).
 */
class CompleteTask
{
    public function __invoke(User $user, Routine $routine, string $dueDate, ?string $note = null): TaskInstance
    {
        $instance = TaskInstance::query()
            ->where('user_id', $user->id)
            ->where('routine_id', $routine->id)
            ->whereDate('due_date', $dueDate)
            ->first() ?? new TaskInstance([
                'user_id' => $user->id,
                'routine_id' => $routine->id,
                'due_date' => $dueDate,
            ]);

        $instance->fill([
            'title' => $routine->title,
            'status' => 'done',
            'completed_at' => CarbonImmutable::now('UTC'),
            'note' => $note,
        ])->save();

        TodayResolver::bust($user->id, $dueDate);

        return $instance;
    }
}
