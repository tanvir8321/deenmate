<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use App\Services\TodayResolver;

/**
 * Removes the materialized row, returning the item to virtual pending.
 */
class UndoTask
{
    public function __invoke(User $user, Routine $routine, string $dueDate): void
    {
        TaskInstance::query()
            ->where('user_id', $user->id)
            ->where('routine_id', $routine->id)
            ->whereDate('due_date', $dueDate)
            ->delete();

        TodayResolver::bust($user->id, $dueDate);
    }
}
