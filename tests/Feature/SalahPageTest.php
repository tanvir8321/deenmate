<?php

namespace Tests\Feature;

use App\Models\SalahLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SalahPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_salah_page_exposes_analytics_props(): void
    {
        $user = User::factory()->create();
        $today = now($user->timezone);

        foreach (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as $p) {
            SalahLog::create([
                'user_id' => $user->id,
                'date' => $today->toDateString(),
                'prayer' => $p,
                'status' => 'jamaat',
            ]);
        }
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 2, 'repaid' => 0]);

        $this->actingAs($user)->get('/salah')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Salah/Index')
                ->has('heatmap', 90)
                ->has('perPrayer.fajr')
                ->has('monthlyBreakdown', 6)
                ->where('qadaSummary.owed', 2)
                ->where('qadaSummary.repaid', 0)
                ->where('qadaSummary.outstanding', 2)
                ->where('qadaSummary.by_prayer.fajr.owed', 2)
                ->where('qadaSummary.by_prayer.fajr.outstanding', 2)
                ->where('currentStreak', 1)
            );
    }

    public function test_salah_page_without_data_still_renders(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/salah')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Salah/Index')
                ->has('heatmap', 90)
                ->has('monthlyBreakdown', 6)
                ->where('qadaSummary.outstanding', 0)
                ->where('currentStreak', 0)
            );
    }

    public function test_repay_endpoint_updates_qada_and_persists(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_dhuhr', 'owed' => 4, 'repaid' => 1]);

        $this->actingAs($user)
            ->post('/salah/repay-qada', ['kind' => 'salah_dhuhr', 'count' => 2])
            ->assertRedirect();

        $counter = $user->qadaCounters()->where('kind', 'salah_dhuhr')->first();
        $this->assertSame(3, $counter->repaid);
    }
}
