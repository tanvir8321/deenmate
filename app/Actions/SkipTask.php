<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use App\Services\TodayResolver;

/**
 * Materializes a virtual routine instance as skipped — idempotent upsert.
 */
class SkipTask
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
            'status' => 'skipped',
            'completed_at' => null,
            'note' => $note,
        ])->save();

        TodayResolver::bust($user->id, $dueDate);

        return $instance;
    }
}
