<?php

namespace Tests\Feature;

use App\Actions\CompleteTask;
use App\Actions\SkipTask;
use App\Actions\UndoTask;
use App\Models\Routine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_materializes_instance(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create(['title' => 'Surah Mulk']);

        $instance = app(CompleteTask::class)($user, $routine, '2026-06-12');

        $this->assertDatabaseHas('task_instances', [
            'id' => $instance->id,
            'user_id' => $user->id,
            'routine_id' => $routine->id,
            'status' => 'done',
            'title' => 'Surah Mulk',
        ]);
        $this->assertNotNull($instance->completed_at);
    }

    public function test_complete_is_idempotent(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        app(CompleteTask::class)($user, $routine, '2026-06-12');
        app(CompleteTask::class)($user, $routine, '2026-06-12');

        $this->assertSame(1, $user->taskInstances()->count());
    }

    public function test_skip_then_complete_updates_same_row(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        $skipped = app(SkipTask::class)($user, $routine, '2026-06-12');
        $completed = app(CompleteTask::class)($user, $routine, '2026-06-12');

        $this->assertSame($skipped->id, $completed->id);
        $this->assertSame('done', $completed->status);
        $this->assertSame(1, $user->taskInstances()->count());
    }

    public function test_undo_removes_materialized_row(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        app(CompleteTask::class)($user, $routine, '2026-06-12');
        app(UndoTask::class)($user, $routine, '2026-06-12');

        $this->assertSame(0, $user->taskInstances()->count());
    }

    // --- endpoints ---

    public function test_complete_endpoint(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        $response = $this->actingAs($user)->post('/tasks/complete', [
            'routine_id' => $routine->id,
            'date' => '2026-06-12',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_instances', [
            'routine_id' => $routine->id,
            'status' => 'done',
        ]);
    }

    public function test_cannot_complete_another_users_routine(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $routine = Routine::factory()->for($other)->create();

        $response = $this->actingAs($user)->post('/tasks/complete', [
            'routine_id' => $routine->id,
            'date' => '2026-06-12',
        ]);

        $response->assertNotFound();
        $this->assertDatabaseCount('task_instances', 0);
    }

    public function test_endpoints_require_auth(): void
    {
        $this->post('/tasks/complete', [])->assertRedirect('/login');
        $this->post('/tasks/skip', [])->assertRedirect('/login');
        $this->post('/tasks/undo', [])->assertRedirect('/login');
    }

    public function test_invalid_date_rejected(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        $response = $this->actingAs($user)->post('/tasks/complete', [
            'routine_id' => $routine->id,
            'date' => '12-06-2026',
        ]);

        $response->assertSessionHasErrors(['date']);
    }
}
