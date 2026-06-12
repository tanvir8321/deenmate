<?php

namespace App\Actions;

use App\Models\Goal;
use App\Models\User;
use App\Services\GoalProgressService;
use Carbon\CarbonImmutable;

/**
 * Create or update a goal with validation on metric_source vs linked_routine_ids.
 */
class UpsertGoal
{
    public function __construct(
        private readonly GoalProgressService $goalProgress,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(User $user, array $data, ?Goal $goal = null): Goal
    {
        if ($goal === null) {
            $goal = new Goal(['user_id' => $user->id]);
        }

        $goal->fill([
            'title' => $data['title'],
            'period' => $data['period'],
            'period_basis' => $data['period_basis'] ?? 'gregorian',
            'target_value' => $data['target_value'],
            'unit' => $data['unit'],
            'metric_source' => $data['metric_source'],
            'linked_routine_ids' => $data['linked_routine_ids'] ?? null,
            'starts_on' => $data['starts_on'],
            'ends_on' => $data['ends_on'] ?? null,
        ])->save();

        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $this->goalProgress->updateForUser($user, $today);

        return $goal;
    }
}
