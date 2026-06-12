<?php

namespace App\Http\Controllers;

use App\Actions\CreateCircle;
use App\Actions\JoinCircle;
use App\Http\Requests\CircleShareRequest;
use App\Http\Requests\JoinCircleRequest;
use App\Http\Requests\StoreCircleRequest;
use App\Models\Circle;
use App\Models\User;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CircleController extends Controller
{
    public function __construct(
        private readonly TodayResolver $today,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $circles = $user->circles()
            ->with('members')
            ->get()
            ->map(function (Circle $circle) use ($user) {
                $members = $circle->members->map(function (User $member) {
                    $localToday = CarbonImmutable::now($member->timezone)->startOfDay();
                    $day = $this->today->for($member, $localToday);
                    $routines = $day['routines'];
                    $total = count($routines);
                    $done = count(array_filter($routines, fn ($r) => $r['status'] === 'done'));
                    $percent = $total > 0 ? (int) round(($done / $total) * 100) : 0;

                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        /** @phpstan-ignore-next-line */
                        'share_level' => $member->pivot->share_level,
                        'done' => $done,
                        'total' => $total,
                        'percent' => $percent,
                    ];
                });

                return [
                    'id' => $circle->id,
                    'name' => $circle->name,
                    'invite_code' => $circle->invite_code,
                    'owner_id' => $circle->owner_id,
                    'is_owner' => $circle->owner_id === $user->id,
                    'members' => $members->values(),
                ];
            });

        return Inertia::render('Circles/Index', [
            'circles' => $circles->values(),
        ]);
    }

    public function store(StoreCircleRequest $request): RedirectResponse
    {
        $circle = (new CreateCircle)($request->user(), $request->validated());

        return redirect()->route('circles.index')->with('success', __('Circle created.'));
    }

    public function join(JoinCircleRequest $request): RedirectResponse
    {
        (new JoinCircle)($request->user(), $request->validated('invite_code'));

        return redirect()->route('circles.index')->with('success', __('Joined circle.'));
    }

    public function leave(Request $request, Circle $circle): RedirectResponse
    {
        $user = $request->user();

        $circle->members()->detach($user->id);

        if ($circle->members()->count() === 0) {
            $circle->delete();
        }

        return redirect()->route('circles.index')->with('success', __('Left circle.'));
    }

    public function updateShare(CircleShareRequest $request, Circle $circle): RedirectResponse
    {
        $user = $request->user();

        $circle->members()->updateExistingPivot($user->id, [
            'share_level' => $request->validated('share_level'),
        ]);

        $localToday = CarbonImmutable::now($user->timezone)->startOfDay();
        TodayResolver::bust($user->id, $localToday->toDateString());

        return redirect()->route('circles.index')->with('success', __('Share level updated.'));
    }
}
