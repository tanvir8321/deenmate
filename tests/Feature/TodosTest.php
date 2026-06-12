<?php

namespace Tests\Feature;

use App\Models\Routine;
use App\Models\Todo;
use App\Models\TodoList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodosTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_shows_own_todos_and_lists(): void
    {
        $user = User::factory()->create();
        $list = TodoList::factory()->for($user)->create(['name' => 'Errands']);
        Todo::factory()->for($user)->create(['todo_list_id' => $list->id]);
        Todo::factory()->create(); // other user's

        $this->actingAs($user)->get('/todos')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Todos/Index')
                ->has('todos', 1)
                ->has('lists', 1)
            );
    }

    public function test_create_todo(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/todos', [
            'title' => 'Buy dates',
            'priority' => 'high',
            'due_date' => '2026-06-12',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('todos', [
            'user_id' => $user->id,
            'title' => 'Buy dates',
            'priority' => 'high',
            'status' => 'pending',
        ]);
    }

    public function test_subtask_creation_and_completion_does_not_complete_parent(): void
    {
        $user = User::factory()->create();
        $parent = Todo::factory()->for($user)->create();

        $this->actingAs($user)->post('/todos', [
            'title' => 'Subtask',
            'parent_id' => $parent->id,
        ])->assertRedirect();

        $sub = Todo::query()->where('parent_id', $parent->id)->firstOrFail();

        $this->actingAs($user)->post("/todos/{$sub->id}/complete")->assertRedirect();

        $this->assertSame('done', $sub->refresh()->status);
        $this->assertSame('pending', $parent->refresh()->status);
    }

    public function test_subtask_cannot_nest_beyond_one_level(): void
    {
        $user = User::factory()->create();
        $parent = Todo::factory()->for($user)->create();
        $sub = Todo::factory()->for($user)->create(['parent_id' => $parent->id]);

        $response = $this->actingAs($user)->post('/todos', [
            'title' => 'Too deep',
            'parent_id' => $sub->id,
        ]);

        $response->assertSessionHasErrors(['parent_id']);
    }

    public function test_complete_and_reopen_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();

        $this->actingAs($user)->post("/todos/{$todo->id}/complete")->assertRedirect();
        $this->assertSame('done', $todo->refresh()->status);
        $this->assertNotNull($todo->completed_at);

        $this->actingAs($user)->post("/todos/{$todo->id}/reopen")->assertRedirect();
        $this->assertSame('pending', $todo->refresh()->status);
        $this->assertNull($todo->completed_at);
    }

    public function test_cannot_touch_others_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create();

        $this->actingAs($user)->post("/todos/{$todo->id}/complete")->assertForbidden();
        $this->actingAs($user)->delete("/todos/{$todo->id}")->assertForbidden();
    }

    public function test_cannot_attach_to_another_users_list(): void
    {
        $user = User::factory()->create();
        $otherList = TodoList::factory()->create();

        $response = $this->actingAs($user)->post('/todos', [
            'title' => 'Sneaky',
            'todo_list_id' => $otherList->id,
        ]);

        $response->assertSessionHasErrors(['todo_list_id']);
    }

    public function test_convert_todo_to_routine(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->dueOn('2026-06-12')->create(['title' => 'Read surah kahf']);

        $response = $this->actingAs($user)->post("/todos/{$todo->id}/convert", [
            'recurrence' => ['freq' => 'weekly', 'days' => ['fri']],
            'fixed_time' => '09:00',
        ]);

        $response->assertRedirect('/routines');

        $this->assertDatabaseHas('routines', [
            'user_id' => $user->id,
            'title' => 'Read surah kahf',
        ]);
        $this->assertSame('cancelled', $todo->refresh()->status);

        $routine = Routine::query()->where('title', 'Read surah kahf')->firstOrFail();
        $this->assertSame(['freq' => 'weekly', 'days' => ['fri']], $routine->recurrence);
    }

    public function test_reorder_updates_sort_order(): void
    {
        $user = User::factory()->create();
        $a = Todo::factory()->for($user)->create();
        $b = Todo::factory()->for($user)->create();

        $this->actingAs($user)->post('/todos/reorder', ['ids' => [$b->id, $a->id]])->assertRedirect();

        $this->assertSame(0, $b->refresh()->sort_order);
        $this->assertSame(1, $a->refresh()->sort_order);
    }

    public function test_todo_list_crud(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/todo-lists', ['name' => 'Ramadan prep'])->assertRedirect();
        $list = $user->todoLists()->firstOrFail();

        $this->actingAs($user)->patch("/todo-lists/{$list->id}", ['name' => 'Renamed'])->assertRedirect();
        $this->assertSame('Renamed', $list->refresh()->name);

        $todo = Todo::factory()->for($user)->create(['todo_list_id' => $list->id]);
        $this->actingAs($user)->delete("/todo-lists/{$list->id}")->assertRedirect();

        $this->assertDatabaseMissing('todo_lists', ['id' => $list->id]);
        $this->assertNull($todo->refresh()->todo_list_id); // todo survives
    }
}
