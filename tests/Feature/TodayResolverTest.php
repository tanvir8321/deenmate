<?php

namespace Tests\Feature;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\Todo;
use App\Models\User;
use App\Services\HijriCalendarService;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodayResolverTest extends TestCase
{
    use RefreshDatabase;

    private function resolver(): TodayResolver
    {
        return app(TodayResolver::class);
    }

    private function dhakaUser(): User
    {
        return User::factory()->create([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
        ]);
    }

    public function test_daily_routine_appears_in_today(): void
    {
        $user = $this->dhakaUser();
        Routine::factory()->for($user)->create([
            'title' => 'Morning adhkar',
            'recurrence' => ['freq' => 'daily'],
        ]);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        $this->assertCount(1, $day['routines']);
        $this->assertSame('Morning adhkar', $day['routines'][0]['title']);
        $this->assertSame('pending', $day['routines'][0]['status']);
    }

    public function test_isha_plus_30_resolves_to_correct_local_time(): void
    {
        $user = $this->dhakaUser();
        Routine::factory()->for($user)->anchored('isha', 30)->create([
            'title' => 'Surah Mulk',
        ]);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        // Dhaka isha 2026-06-12 = 20:13 (±2 min) → +30 = ~20:43.
        $time = $day['routines'][0]['time'];
        $minutes = ((int) substr($time, 0, 2)) * 60 + (int) substr($time, 3, 2);
        $this->assertEqualsWithDelta(20 * 60 + 43, $minutes, 2);
        $this->assertSame('after_isha', $day['routines'][0]['bucket']);
    }

    public function test_weekly_routine_only_on_matching_days(): void
    {
        $user = $this->dhakaUser();
        Routine::factory()->for($user)->create([
            'recurrence' => ['freq' => 'weekly', 'days' => ['fri']],
        ]);

        $friday = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));
        $saturday = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-13', 'Asia/Dhaka'));

        $this->assertCount(1, $friday['routines']);
        $this->assertCount(0, $saturday['routines']);
    }

    public function test_hijri_white_days_rule_appears_only_on_those_days(): void
    {
        $user = $this->dhakaUser();
        Routine::factory()->for($user)->create([
            'title' => 'White days fast',
            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [13, 14, 15]],
            'starts_on' => '2025-01-01',
        ]);

        $hijriService = app(HijriCalendarService::class);
        $day13 = $hijriService->toGregorian(1447, 12, 13);
        $day16 = $hijriService->toGregorian(1447, 12, 16);

        $on13 = $this->resolver()->for($user, $day13->setTimezone('Asia/Dhaka')->startOfDay());
        $on16 = $this->resolver()->for($user, $day16->setTimezone('Asia/Dhaka')->startOfDay());

        $this->assertCount(1, $on13['routines']);
        $this->assertCount(0, $on16['routines']);
    }

    public function test_hijri_offset_shifts_matching_date(): void
    {
        $user = $this->dhakaUser();
        $user->update(['hijri_offset' => -1]);

        Routine::factory()->for($user)->create([
            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [13]],
            'starts_on' => '2025-01-01',
        ]);

        $hijriService = app(HijriCalendarService::class);
        // With offset -1, Gregorian date of Hijri 13th shifts one day later.
        $day13 = $hijriService->toGregorian(1447, 12, 13);

        $onBase = $this->resolver()->for($user, $day13->setTimezone('Asia/Dhaka')->startOfDay());
        TodayResolver::bust($user->id, $day13->addDay()->toDateString());
        $onShifted = $this->resolver()->for($user, $day13->addDay()->setTimezone('Asia/Dhaka')->startOfDay());

        $this->assertCount(0, $onBase['routines']);
        $this->assertCount(1, $onShifted['routines']);
    }

    public function test_materialized_instance_overrides_status(): void
    {
        $user = $this->dhakaUser();
        $routine = Routine::factory()->for($user)->create();
        TaskInstance::factory()->for($user)->for($routine)->create([
            'due_date' => '2026-06-12',
            'status' => 'done',
        ]);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        $this->assertSame('done', $day['routines'][0]['status']);
        $this->assertNotNull($day['routines'][0]['instance_id']);
    }

    public function test_todo_due_today_appears_and_overdue_in_separate_bucket(): void
    {
        $user = $this->dhakaUser();
        Todo::factory()->for($user)->dueOn('2026-06-12')->create(['title' => 'Due today']);
        Todo::factory()->for($user)->dueOn('2026-06-10')->create(['title' => 'Overdue one']);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        $this->assertCount(1, $day['todos']);
        $this->assertSame('Due today', $day['todos'][0]['title']);
        $this->assertCount(1, $day['overdue']);
        $this->assertSame('Overdue one', $day['overdue'][0]['title']);
    }

    public function test_overdue_bucket_is_capped_at_10(): void
    {
        $user = $this->dhakaUser();
        for ($i = 1; $i <= 12; $i++) {
            Todo::factory()->for($user)->dueOn('2026-06-01')->create();
        }

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        $this->assertCount(10, $day['overdue']);
    }

    public function test_inactive_or_out_of_range_routines_excluded(): void
    {
        $user = $this->dhakaUser();
        Routine::factory()->for($user)->create(['is_active' => false]);
        Routine::factory()->for($user)->create(['starts_on' => '2026-07-01']);
        Routine::factory()->for($user)->create(['starts_on' => '2026-01-01', 'ends_on' => '2026-05-31']);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka'));

        $this->assertCount(0, $day['routines']);
    }

    public function test_works_across_timezones(): void
    {
        foreach (['Asia/Dhaka', 'Europe/London', 'America/New_York'] as $tz) {
            $user = User::factory()->create(['timezone' => $tz]);
            Routine::factory()->for($user)->create([
                'fixed_time' => '06:00',
                'recurrence' => ['freq' => 'daily'],
            ]);

            $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', $tz));

            $this->assertCount(1, $day['routines'], $tz);
            $this->assertSame('06:00', $day['routines'][0]['time'], $tz);
        }
    }

    public function test_fixed_time_routine_gets_clock_bucket_without_location(): void
    {
        $user = User::factory()->create(['timezone' => 'Europe/London']);
        Routine::factory()->for($user)->create(['fixed_time' => '13:00']);

        $day = $this->resolver()->for($user, CarbonImmutable::parse('2026-06-12', 'Europe/London'));

        $this->assertSame('midday', $day['routines'][0]['bucket']);
    }
}
