<?php

namespace Tests\Feature;

use App\Models\GoalProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoalsTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_auth(): void
    {
        $this->get('/goals')->assertRedirect('/login');
    }

    public function test_index_lists_own_goals_with_progress(): void
    {
        $user = User::factory()->create();
        $goal = $user->goals()->create([
            'title' => 'Daily Quran Page',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'pages',
            'metric_source' => 'quran_pages',
            'starts_on' => now()->toDateString(),
        ]);
        GoalProgress::create([
            'goal_id' => $goal->id,
            'period_key' => now()->toDateString(),
            'current_value' => 1,
        ]);

        $other = User::factory()->create();
        $other->goals()->create([
            'title' => 'Other user goal',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => now()->toDateString(),
        ]);

        $this->actingAs($user)->get('/goals')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Goals/Index')
                ->has('goals', 1)
                ->where('goals.0.id', $goal->id)
                ->where('goals.0.current_value', 1)
                ->where('goals.0.progress_pct', 100)
            );
    }

    public function test_store_creates_goal(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/goals', [
            'title' => 'Daily Quran',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'pages',
            'metric_source' => 'quran_pages',
            'starts_on' => '2026-06-01',
        ])->assertRedirect('/goals');

        $this->assertDatabaseHas('goals', [
            'user_id' => $user->id,
            'title' => 'Daily Quran',
            'metric_source' => 'quran_pages',
        ]);
    }

    public function test_store_coerces_empty_ends_on_to_null(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/goals', [
            'title' => 'Daily Quran',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'pages',
            'metric_source' => 'quran_pages',
            'starts_on' => '2026-06-01',
            'ends_on' => '',
        ])->assertRedirect();

        $goal = $user->goals()->first();
        $this->assertNull($goal->ends_on);
    }

    public function test_store_validates_metric_source(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/goals', [
            'title' => 'Bad goal',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'not_a_source',
            'starts_on' => '2026-06-01',
        ])->assertSessionHasErrors('metric_source');
    }

    public function test_store_requires_linked_routines_for_routine_completions(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/goals', [
            'title' => 'Routine goal',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 5,
            'unit' => 'count',
            'metric_source' => 'routine_completions',
            'linked_routine_ids' => [],
            'starts_on' => '2026-06-01',
        ])->assertSessionHasErrors('linked_routine_ids');
    }

    public function test_update_own_goal(): void
    {
        $user = User::factory()->create();
        $goal = $user->goals()->create([
            'title' => 'Original',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => '2026-06-01',
        ]);

        $this->actingAs($user)->put("/goals/{$goal->id}", [
            'title' => 'Updated',
            'period' => 'monthly',
            'period_basis' => 'gregorian',
            'target_value' => 5,
            'unit' => 'count',
            'metric_source' => 'salah_jamaat',
            'starts_on' => '2026-06-01',
        ])->assertRedirect('/goals');

        $goal->refresh();
        $this->assertSame('Updated', $goal->title);
        $this->assertSame('monthly', $goal->period);
        $this->assertSame('salah_jamaat', $goal->metric_source);
    }

    public function test_cannot_update_others_goal(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $goal = $other->goals()->create([
            'title' => 'Other',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => '2026-06-01',
        ]);

        $this->actingAs($user)->put("/goals/{$goal->id}", [
            'title' => 'Stolen',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => '2026-06-01',
        ])->assertForbidden();
    }

    public function test_destroy_own_goal_cascades_progress(): void
    {
        $user = User::factory()->create();
        $goal = $user->goals()->create([
            'title' => 'Doomed',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => '2026-06-01',
        ]);
        GoalProgress::create(['goal_id' => $goal->id, 'period_key' => '2026-06-13', 'current_value' => 1]);

        $this->actingAs($user)->delete("/goals/{$goal->id}")
            ->assertRedirect('/goals');

        $this->assertDatabaseMissing('goals', ['id' => $goal->id]);
        $this->assertDatabaseMissing('goal_progress', ['goal_id' => $goal->id]);
    }

    public function test_cannot_destroy_others_goal(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $goal = $other->goals()->create([
            'title' => 'Other',
            'period' => 'daily',
            'period_basis' => 'gregorian',
            'target_value' => 1,
            'unit' => 'count',
            'metric_source' => 'manual',
            'starts_on' => '2026-06-01',
        ]);

        $this->actingAs($user)->delete("/goals/{$goal->id}")
            ->assertForbidden();
    }
}
