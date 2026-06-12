<?php

namespace Tests\Feature;

use App\Models\SalahLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardSalahWidgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_exposes_salah_props(): void
    {
        $user = User::factory()->create();
        $today = now($user->timezone)->toDateString();

        SalahLog::create(['user_id' => $user->id, 'date' => $today, 'prayer' => 'fajr', 'status' => 'jamaat']);
        SalahLog::create(['user_id' => $user->id, 'date' => $today, 'prayer' => 'dhuhr', 'status' => 'qada']);
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 3, 'repaid' => 1]);

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('salahHeatmap', 90)
                ->where('salahBreakdown.jamaat', 1)
                ->where('salahBreakdown.qada', 1)
                ->where('salahStreak', 0)
                ->where('qadaSummary.owed', 3)
                ->where('qadaSummary.repaid', 1)
                ->where('qadaSummary.outstanding', 2)
                ->where('qadaSummary.by_prayer.fajr.owed', 3)
                ->where('qadaSummary.by_prayer.fajr.repaid', 1)
            );
    }

    public function test_dashboard_salah_streak_counts_full_days(): void
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

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('salahStreak', 1)
            );
    }

    public function test_dashboard_qada_summary_handles_no_data(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('qadaSummary.owed', 0)
                ->where('qadaSummary.repaid', 0)
                ->where('qadaSummary.outstanding', 0)
            );
    }
}
