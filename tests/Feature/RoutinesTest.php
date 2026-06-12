<?php

namespace Tests\Feature;

use App\Models\Routine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoutinesTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_own_routines_only(): void
    {
        $user = User::factory()->create();
        Routine::factory()->for($user)->create(['title' => 'Mine']);
        Routine::factory()->create(['title' => 'Theirs']);

        $this->actingAs($user)->get('/routines')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Routines/Index')
                ->has('routines', 1)
                ->where('routines.0.title', 'Mine')
            );
    }

    public function test_store_creates_routine_with_normalized_rule(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/routines', [
            'title' => 'Surah Mulk',
            'category' => 'quran',
            'recurrence' => [
                'freq' => 'daily',
                'days' => ['mon'], // stray key — must be stripped
            ],
            'anchor' => 'isha',
            'offset_minutes' => 30,
            'reminder_enabled' => true,
            'nag_mode' => false,
            'starts_on' => '2026-06-01',
        ]);

        $response->assertRedirect('/routines');

        $routine = $user->routines()->first();
        $this->assertSame(['freq' => 'daily'], $routine->recurrence);
        $this->assertSame('isha', $routine->anchor);
        $this->assertSame(30, $routine->offset_minutes);
        $this->assertTrue($routine->reminder_enabled);
    }

    public function test_store_validates_weekly_needs_days(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/routines', [
            'title' => 'X',
            'category' => 'general',
            'recurrence' => ['freq' => 'weekly'],
            'starts_on' => '2026-06-01',
        ]);

        $response->assertSessionHasErrors(['recurrence.days']);
    }

    public function test_anchor_and_fixed_time_are_mutually_exclusive(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/routines', [
            'title' => 'X',
            'category' => 'general',
            'recurrence' => ['freq' => 'daily'],
            'anchor' => 'fajr',
            'fixed_time' => '06:00',
            'starts_on' => '2026-06-01',
        ]);

        $response->assertSessionHasErrors(['fixed_time']);
    }

    public function test_update_own_routine(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        $response = $this->actingAs($user)->put("/routines/{$routine->id}", [
            'title' => 'Updated',
            'category' => 'adhkar',
            'recurrence' => ['freq' => 'weekly', 'days' => ['mon', 'thu']],
            'starts_on' => '2026-06-01',
            'is_active' => false,
        ]);

        $response->assertRedirect('/routines');
        $routine->refresh();
        $this->assertSame('Updated', $routine->title);
        $this->assertFalse($routine->is_active);
        $this->assertSame(['freq' => 'weekly', 'days' => ['mon', 'thu']], $routine->recurrence);
    }

    public function test_cannot_edit_or_delete_others_routine(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->create();

        $this->actingAs($user)->get("/routines/{$routine->id}/edit")->assertForbidden();
        $this->actingAs($user)->delete("/routines/{$routine->id}")->assertForbidden();
    }

    public function test_destroy_deletes_routine(): void
    {
        $user = User::factory()->create();
        $routine = Routine::factory()->for($user)->create();

        $this->actingAs($user)->delete("/routines/{$routine->id}")->assertRedirect('/routines');

        $this->assertDatabaseMissing('routines', ['id' => $routine->id]);
    }
}
