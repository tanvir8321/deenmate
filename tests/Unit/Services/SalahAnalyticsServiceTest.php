<?php

namespace Tests\Unit\Services;

use App\Models\SalahLog;
use App\Models\User;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SalahAnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    private SalahAnalyticsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SalahAnalyticsService::class);
    }

    private function log(User $user, string $date, string $prayer, string $status): SalahLog
    {
        return $user->salahLogs()->create([
            'date' => $date,
            'prayer' => $prayer,
            'status' => $status,
        ]);
    }

    public function test_breakdown_aggregates_statuses_in_range(): void
    {
        $user = User::factory()->create();
        $this->log($user, '2026-06-10', 'fajr', 'jamaat');
        $this->log($user, '2026-06-10', 'dhuhr', 'alone');
        $this->log($user, '2026-06-10', 'asr', 'qada');
        $this->log($user, '2026-06-10', 'maghrib', 'missed');
        $this->log($user, '2026-06-10', 'isha', 'jamaat');
        $this->log($user, '2026-06-09', 'fajr', 'jamaat');

        $from = CarbonImmutable::parse('2026-06-10');
        $to = CarbonImmutable::parse('2026-06-10');

        $out = $this->service->breakdown($user, $from, $to);

        $this->assertSame(['jamaat' => 2, 'alone' => 1, 'qada' => 1, 'missed' => 1], $out);
    }

    public function test_heatmap_returns_90_rows_with_zero_filled_days(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');

        $this->log($user, $today->toDateString(), 'fajr', 'jamaat');
        $this->log($user, $today->toDateString(), 'dhuhr', 'jamaat');
        $this->log($user, $today->toDateString(), 'asr', 'qada');
        $this->log($user, $today->subDays(2)->toDateString(), 'fajr', 'alone');

        $cells = $this->service->heatmap($user, 90, $today);

        $this->assertCount(90, $cells);
        $first = $cells[0];
        $this->assertSame($today->subDays(89)->toDateString(), $first['date']);
        $this->assertSame(0, $first['value']);

        $last = $cells[89];
        $this->assertSame($today->toDateString(), $last['date']);
        $this->assertSame(2, $last['value']);

        $byDate = collect($cells)->keyBy('date');
        $this->assertSame(1, $byDate[$today->subDays(2)->toDateString()]['value']);
    }

    public function test_heatmap_value_is_capped_at_5(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $this->log($user, $today->toDateString(), $p, 'jamaat');
        }

        $cells = $this->service->heatmap($user, 90, $today);
        $byDate = collect($cells)->keyBy('date');
        $this->assertSame(5, $byDate[$today->toDateString()]['value']);
    }

    public function test_heatmap_excludes_qada_and_missed_from_value(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        $this->log($user, $today->toDateString(), 'fajr', 'qada');
        $this->log($user, $today->toDateString(), 'dhuhr', 'missed');

        $cells = $this->service->heatmap($user, 90, $today);
        $byDate = collect($cells)->keyBy('date');
        $this->assertSame(0, $byDate[$today->toDateString()]['value']);
    }

    public function test_current_streak_counts_consecutive_full_days(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $this->log($user, $today->toDateString(), $p, 'jamaat');
            $this->log($user, $today->subDay()->toDateString(), $p, 'alone');
            $this->log($user, $today->subDays(2)->toDateString(), $p, 'jamaat');
        }

        $this->assertSame(3, $this->service->currentStreak($user, $today));
    }

    public function test_current_streak_breaks_on_incomplete_day(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $this->log($user, $today->toDateString(), $p, 'jamaat');
        }
        $this->log($user, $today->subDay()->toDateString(), 'fajr', 'jamaat');
        $this->log($user, $today->subDay()->toDateString(), 'dhuhr', 'missed');

        $this->assertSame(1, $this->service->currentStreak($user, $today));
    }

    public function test_current_streak_breaks_on_missing_day(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        $this->log($user, $today->toDateString(), 'fajr', 'jamaat');

        $this->assertSame(0, $this->service->currentStreak($user, $today));
    }

    public function test_per_prayer_consistency_calculates_pct(): void
    {
        $user = User::factory()->create();
        $from = CarbonImmutable::parse('2026-06-01');
        $to = CarbonImmutable::parse('2026-06-10');

        $this->log($user, '2026-06-01', 'fajr', 'jamaat');
        $this->log($user, '2026-06-02', 'fajr', 'alone');
        $this->log($user, '2026-06-03', 'fajr', 'qada');
        $this->log($user, '2026-06-04', 'fajr', 'missed');
        $this->log($user, '2026-06-01', 'dhuhr', 'jamaat');
        $this->log($user, '2026-06-02', 'dhuhr', 'jamaat');

        $out = $this->service->perPrayerConsistency($user, $from, $to);

        $this->assertSame(4, $out['fajr']['recorded']);
        $this->assertSame(50.0, $out['fajr']['pct']);
        $this->assertSame(2, $out['dhuhr']['recorded']);
        $this->assertSame(100.0, $out['dhuhr']['pct']);
        $this->assertSame(0, $out['asr']['recorded']);
        $this->assertSame(0.0, $out['asr']['pct']);
    }

    public function test_monthly_breakdown_returns_six_months_inclusive(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-15')->startOfMonth();
        $this->log($user, '2026-04-10', 'fajr', 'jamaat');

        $months = $this->service->monthlyBreakdown($user, 6, $today);

        $this->assertCount(6, $months);
        $this->assertSame('2026-01', $months[0]['month']);
        $this->assertSame('2026-06', $months[5]['month']);
        $this->assertSame(1, $months[3]['jamaat']);
    }

    public function test_bust_forgets_cached_keys(): void
    {
        $user = User::factory()->create();
        $today = CarbonImmutable::parse('2026-06-13');
        $this->log($user, $today->toDateString(), 'fajr', 'jamaat');

        $this->service->heatmap($user, 90, $today);
        $key = SalahAnalyticsService::cacheKey($user->id, 'heatmap', '90:'.$today->toDateString());
        $this->assertTrue(Cache::has($key));

        SalahAnalyticsService::bust($user->id, $today);
        $this->assertFalse(Cache::has($key));
    }

    public function test_heatmap_works_across_timezones(): void
    {
        foreach (['Asia/Dhaka', 'Europe/London', 'America/New_York'] as $tz) {
            $user = User::factory()->create(['timezone' => $tz]);
            $today = CarbonImmutable::parse('2026-06-13');

            foreach (SalahAnalyticsService::PRAYERS as $p) {
                $this->log($user, $today->toDateString(), $p, 'jamaat');
            }

            $cells = $this->service->heatmap($user, 90, $today);
            $byDate = collect($cells)->keyBy('date');

            $this->assertSame(
                5,
                $byDate[$today->toDateString()]['value'],
                "Heatmap intensity wrong for tz={$tz}",
            );
        }
    }
}
