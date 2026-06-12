<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalahRepayQadaTest extends TestCase
{
    use RefreshDatabase;

    public function test_requires_auth(): void
    {
        $this->post('/salah/repay-qada', ['kind' => 'salah_fajr'])
            ->assertRedirect('/login');
    }

    public function test_repay_increments_counter(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 5, 'repaid' => 1]);

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'salah_fajr', 'count' => 1])
            ->assertRedirect();

        $counter = $user->qadaCounters()->where('kind', 'salah_fajr')->first();
        $this->assertSame(2, $counter->repaid);
    }

    public function test_invalid_kind_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'not_a_kind'])
            ->assertSessionHasErrors('kind');
    }

    public function test_count_validation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'salah_fajr', 'count' => 0])
            ->assertSessionHasErrors('count');

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'salah_fajr', 'count' => 11])
            ->assertSessionHasErrors('count');
    }

    public function test_repay_caps_at_owed(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 1, 'repaid' => 1]);

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'salah_fajr', 'count' => 5])
            ->assertRedirect();

        $counter = $user->qadaCounters()->where('kind', 'salah_fajr')->first();
        $this->assertSame(1, $counter->repaid);
    }
}
