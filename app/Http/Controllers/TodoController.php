<?php

namespace App\Http\Controllers;

use App\Actions\CompleteTodo;
use App\Actions\ConvertTodoToRoutine;
use App\Actions\CreateTodo;
use App\Actions\DeleteTodo;
use App\Actions\ReopenTodo;
use App\Actions\UpdateTodo;
use App\Http\Requests\SaveTodoRequest;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $listId = $request->integer('list') ?: null;

        $todos = $user->todos()
            ->whereNull('parent_id')
            ->when($listId, fn ($q) => $q->where('todo_list_id', $listId))
            ->with('subtasks')
            ->orderByRaw("status = 'pending' desc")
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Todo $todo) => $this->shape($todo));

        $lists = $user->todoLists()
            ->withCount(['todos as pending_count' => fn ($q) => $q->where('status', 'pending')])
            ->orderBy('sort_order')
            ->get(['id', 'name', 'color', 'sort_order']);

        return Inertia::render('Todos/Index', [
            'todos' => $todos,
            'lists' => $lists,
            'activeList' => $listId,
        ]);
    }

    public function store(SaveTodoRequest $request, CreateTodo $action): RedirectResponse
    {
        $action($request->user(), $request->validated());

        return back();
    }

    public function update(SaveTodoRequest $request, Todo $todo, UpdateTodo $action): RedirectResponse
    {
        abort_unless($todo->user_id === $request->user()->id, 403);

        $action($todo, $request->validated());

        return back();
    }

    public function destroy(Request $request, Todo $todo, DeleteTodo $action): RedirectResponse
    {
        abort_unless($todo->user_id === $request->user()->id, 403);

        $action($todo);

        return back();
    }

    public function complete(Request $request, Todo $todo, CompleteTodo $action): RedirectResponse
    {
        abort_unless($todo->user_id === $request->user()->id, 403);

        $action($todo);

        return back();
    }

    public function reopen(Request $request, Todo $todo, ReopenTodo $action): RedirectResponse
    {
        abort_unless($todo->user_id === $request->user()->id, 403);

        $action($todo);

        return back();
    }

    public function convert(Request $request, Todo $todo, ConvertTodoToRoutine $action): RedirectResponse
    {
        abort_unless($todo->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'recurrence' => ['required', 'array'],
            'recurrence.freq' => ['required', 'in:daily,weekly,monthly,yearly,hijri_monthly,hijri_yearly,interval'],
            'fixed_time' => ['nullable', 'date_format:H:i'],
        ]);

        // validated() strips nested keys without explicit rules — pass the full rule object.
        $action($todo, (array) $request->input('recurrence'), $validated['fixed_time'] ?? null);

        return redirect()->route('routines.index')->with('status', 'todo-converted');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $user = $request->user();
        foreach (array_values($validated['ids']) as $position => $id) {
            $user->todos()->where('id', $id)->update(['sort_order' => $position]);
        }

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function shape(Todo $todo): array
    {
        return [
            'id' => $todo->id,
            'title' => $todo->title,
            'description' => $todo->description,
            'priority' => $todo->priority,
            'due_date' => $todo->due_date?->toDateString(),
            'status' => $todo->status,
            'list_id' => $todo->todo_list_id,
            'sort_order' => $todo->sort_order,
            'subtasks' => $todo->subtasks->map(fn (Todo $sub) => [
                'id' => $sub->id,
                'title' => $sub->title,
                'status' => $sub->status,
            ]),
        ];
    }
}
