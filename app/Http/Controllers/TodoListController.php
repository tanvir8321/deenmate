<?php

namespace App\Http\Controllers;

use App\Models\TodoList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TodoListController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $request->user()->todoLists()->create($validated);

        return back();
    }

    public function update(Request $request, TodoList $todoList): RedirectResponse
    {
        abort_unless($todoList->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $todoList->update($validated);

        return back();
    }

    public function destroy(Request $request, TodoList $todoList): RedirectResponse
    {
        abort_unless($todoList->user_id === $request->user()->id, 403);

        $todoList->delete(); // todos keep existing with null list (FK nullOnDelete)

        return back();
    }
}
