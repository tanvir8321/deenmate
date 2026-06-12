<?php

namespace App\Http\Controllers;

use App\Actions\UpsertGoal;
use App\Http\Requests\SaveGoalRequest;
use App\Models\Goal;
use App\Services\GoalProgressService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function __construct(
        private readonly GoalProgressService $goalProgress,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();

        $goals = Goal::query()
            ->where('user_id', $user->id)
            ->orderByDesc('starts_on')
            ->get()
            ->map(function (Goal $goal) use ($today) {
                $key = $this->goalProgress->periodKey($goal, $today);
                $progress = $goal->goalProgress()->where('period_key', $key)->first();

                return [
                    'id' => $goal->id,
                    'title' => $goal->title,
                    'period' => $goal->period,
                    'period_basis' => $goal->period_basis,
                    'target_value' => $goal->target_value,
                    'unit' => $goal->unit,
                    'metric_source' => $goal->metric_source,
                    'linked_routine_ids' => $goal->linked_routine_ids,
                    'starts_on' => $goal->starts_on->toDateString(),
                    'ends_on' => $goal->ends_on?->toDateString(),
                    'current_value' => $progress->current_value ?? 0,
                    'progress_pct' => $goal->target_value > 0
                        ? round((($progress->current_value ?? 0) / $goal->target_value) * 100, 1)
                        : 0,
                ];
            });

        return Inertia::render('Goals/Index', [
            'goals' => $goals->values(),
        ]);
    }

    public function store(SaveGoalRequest $request, UpsertGoal $action): RedirectResponse
    {
        $action($request->user(), $request->validated());

        return redirect()->route('goals.index')->with('status', 'goal-saved');
    }

    public function update(SaveGoalRequest $request, Goal $goal, UpsertGoal $action): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);

        $action($request->user(), $request->validated(), $goal);

        return redirect()->route('goals.index')->with('status', 'goal-saved');
    }

    public function destroy(Request $request, Goal $goal): RedirectResponse
    {
        abort_unless($goal->user_id === $request->user()->id, 403);

        $goal->goalProgress()->delete();
        $goal->delete();

        return redirect()->route('goals.index')->with('status', 'goal-deleted');
    }
}
