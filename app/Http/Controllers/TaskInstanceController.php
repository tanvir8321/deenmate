<?php

namespace App\Http\Controllers;

use App\Actions\CompleteTask;
use App\Actions\SkipTask;
use App\Actions\UndoTask;
use App\Models\Routine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskInstanceController extends Controller
{
    public function complete(Request $request, CompleteTask $action): RedirectResponse
    {
        [$routine, $date] = $this->resolve($request);

        $action($request->user(), $routine, $date, $request->input('note'));

        return back();
    }

    public function skip(Request $request, SkipTask $action): RedirectResponse
    {
        [$routine, $date] = $this->resolve($request);

        $action($request->user(), $routine, $date, $request->input('note'));

        return back();
    }

    public function undo(Request $request, UndoTask $action): RedirectResponse
    {
        [$routine, $date] = $this->resolve($request);

        $action($request->user(), $routine, $date);

        return back();
    }

    /**
     * @return array{0: Routine, 1: string}
     */
    private function resolve(Request $request): array
    {
        $validated = $request->validate([
            'routine_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $routine = $request->user()->routines()->findOrFail($validated['routine_id']);

        return [$routine, $validated['date']];
    }
}
