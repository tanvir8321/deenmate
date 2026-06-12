<?php

namespace App\Http\Controllers;

use App\Actions\SaveRoutine;
use App\Http\Requests\SaveRoutineRequest;
use App\Models\Routine;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoutineController extends Controller
{
    public function index(Request $request): Response
    {
        $routines = $request->user()->routines()
            ->orderByDesc('is_active')
            ->orderBy('title')
            ->get()
            ->map(fn (Routine $r) => $this->shape($r));

        return Inertia::render('Routines/Index', [
            'routines' => $routines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Routines/Form', ['routine' => null]);
    }

    public function store(SaveRoutineRequest $request, SaveRoutine $action): RedirectResponse
    {
        $action($request->user(), $request->validated());

        return redirect()->route('routines.index')->with('status', 'routine-saved');
    }

    public function edit(Request $request, Routine $routine): Response
    {
        abort_unless($routine->user_id === $request->user()->id, 403);

        return Inertia::render('Routines/Form', [
            'routine' => $this->shape($routine),
        ]);
    }

    public function update(SaveRoutineRequest $request, Routine $routine, SaveRoutine $action): RedirectResponse
    {
        abort_unless($routine->user_id === $request->user()->id, 403);

        $action($request->user(), $request->validated(), $routine);

        return redirect()->route('routines.index')->with('status', 'routine-saved');
    }

    public function destroy(Request $request, Routine $routine): RedirectResponse
    {
        abort_unless($routine->user_id === $request->user()->id, 403);

        $routine->delete();
        TodayResolver::bust($request->user()->id, CarbonImmutable::now($request->user()->timezone)->toDateString());

        return redirect()->route('routines.index')->with('status', 'routine-deleted');
    }

    /**
     * @return array<string, mixed>
     */
    private function shape(Routine $r): array
    {
        return [
            'id' => $r->id,
            'title' => $r->title,
            'category' => $r->category,
            'recurrence' => $r->recurrence,
            'anchor' => $r->anchor,
            'offset_minutes' => $r->offset_minutes,
            'fixed_time' => $r->fixed_time ? substr($r->fixed_time, 0, 5) : null,
            'reminder_enabled' => $r->reminder_enabled,
            'nag_mode' => $r->nag_mode,
            'starts_on' => $r->starts_on->toDateString(),
            'ends_on' => $r->ends_on?->toDateString(),
            'is_active' => $r->is_active,
        ];
    }
}
