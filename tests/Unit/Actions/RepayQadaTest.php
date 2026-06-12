<?php

namespace Tests\Unit\Actions;

use App\Actions\RepayQada;
use App\Models\QadaCounter;
use App\Models\User;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RepayQadaTest extends TestCase
{
    use RefreshDatabase;

    public function test_increments_repaid_when_room(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 5, 'repaid' => 1]);

        $action = app(RepayQada::class);
        $counter = $action($user, 'salah_fajr', 1);

        $this->assertSame(2, $counter->repaid);
        $this->assertSame(5, $counter->owed);
    }

    public function test_increments_repaid_by_full_count_when_room(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 10, 'repaid' => 2]);

        $counter = app(RepayQada::class)($user, 'salah_fajr', 3);

        $this->assertSame(5, $counter->repaid);
    }

    public function test_caps_at_owed(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 3, 'repaid' => 3]);

        $counter = app(RepayQada::class)($user, 'salah_fajr', 1);

        $this->assertSame(3, $counter->repaid);
    }

    public function test_creates_row_when_missing(): void
    {
        $user = User::factory()->create();

        $counter = app(RepayQada::class)($user, 'salah_dhuhr', 1);

        $this->assertSame(0, $counter->owed);
        $this->assertSame(0, $counter->repaid);
        $this->assertSame(1, QadaCounter::where('user_id', $user->id)->count());
    }

    public function test_count_zero_is_noop(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 5, 'repaid' => 0]);

        $counter = app(RepayQada::class)($user, 'salah_fajr', 0);

        $this->assertSame(0, $counter->repaid);
    }

    public function test_busts_analytics_cache(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();
        $key = SalahAnalyticsService::cacheKey($user->id, 'breakdown', $today->subDay()->toDateString().':'.$today->toDateString());
        Cache::put($key, ['cached' => true], 60);

        app(RepayQada::class)($user, 'salah_fajr', 1);

        $this->assertFalse(Cache::has($key));
    }
}
