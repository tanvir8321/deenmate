<?php

namespace Tests\Unit\Actions;

use App\Actions\LogSalah;
use App\Models\User;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class LogSalahCacheBustTest extends TestCase
{
    use RefreshDatabase;

    public function test_logging_salah_busts_dashboard_stats_cache(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        $dateKey = $today->toDateString();
        Cache::put("dashboard_stats:{$user->id}:{$dateKey}", ['cached' => true], 60);
        Cache::put("weekly_stats:{$user->id}:{$dateKey}", ['cached' => true], 60);

        app(LogSalah::class)($user, $today, 'fajr', 'jamaat');

        $this->assertFalse(Cache::has("dashboard_stats:{$user->id}:{$dateKey}"));
        $this->assertFalse(Cache::has("weekly_stats:{$user->id}:{$dateKey}"));
    }

    public function test_logging_salah_busts_salah_analytics_caches(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        $heatmapKey = SalahAnalyticsService::cacheKey($user->id, 'heatmap', '90:'.$today->toDateString());
        $breakdownKey = SalahAnalyticsService::cacheKey($user->id, 'breakdown', $today->subDay()->toDateString().':'.$today->toDateString());
        Cache::put($heatmapKey, ['cached' => true], 60);
        Cache::put($breakdownKey, ['cached' => true], 60);

        app(LogSalah::class)($user, $today, 'fajr', 'jamaat');

        $this->assertFalse(Cache::has($heatmapKey));
        $this->assertFalse(Cache::has($breakdownKey));
    }

    public function test_logging_salah_is_idempotent(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');

        $first = app(LogSalah::class)($user, $today, 'fajr', 'jamaat');
        $second = app(LogSalah::class)($user, $today, 'fajr', 'alone');

        $this->assertSame($first->id, $second->id);
        $this->assertSame('alone', $second->status);
    }
}
