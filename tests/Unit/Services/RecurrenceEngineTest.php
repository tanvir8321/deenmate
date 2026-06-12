<?php

namespace Tests\Unit\Services;

use App\Services\RecurrenceEngine;
use App\ValueObjects\HijriDate;
use Carbon\CarbonImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class RecurrenceEngineTest extends TestCase
{
    private RecurrenceEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new RecurrenceEngine;
    }

    private function hijri(int $year, int $month, int $day, int $monthLength = 30): HijriDate
    {
        return new HijriDate($year, $month, $day, $monthLength);
    }

    private function anyHijri(): HijriDate
    {
        return $this->hijri(1447, 12, 26, 29);
    }

    // --- daily ---

    public function test_daily_matches_every_date(): void
    {
        foreach (['2026-06-12', '2026-01-01', '2024-02-29'] as $date) {
            $this->assertTrue($this->engine->matches(
                ['freq' => 'daily'],
                CarbonImmutable::parse($date),
                $this->anyHijri(),
            ));
        }
    }

    // --- weekly ---

    public function test_weekly_matches_only_listed_days(): void
    {
        $rule = ['freq' => 'weekly', 'days' => ['mon', 'thu']];

        // 2026-06-08 Mon, 06-11 Thu, 06-12 Fri.
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-08'), $this->anyHijri()));
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-11'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-06-12'), $this->anyHijri()));
    }

    public function test_weekly_day_names_are_case_insensitive(): void
    {
        $rule = ['freq' => 'weekly', 'days' => ['MON']];

        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-08'), $this->anyHijri()));
    }

    public function test_weekly_with_no_days_never_matches(): void
    {
        $this->assertFalse($this->engine->matches(
            ['freq' => 'weekly', 'days' => []],
            CarbonImmutable::parse('2026-06-08'),
            $this->anyHijri(),
        ));
    }

    // --- monthly ---

    public function test_monthly_matches_day_of_month(): void
    {
        $rule = ['freq' => 'monthly', 'day_of_month' => 1];

        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-01'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-06-02'), $this->anyHijri()));
    }

    public function test_monthly_day_31_clamps_to_february_end(): void
    {
        $rule = ['freq' => 'monthly', 'day_of_month' => 31];

        // Non-leap February: fires on the 28th.
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-02-28'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-02-27'), $this->anyHijri()));

        // Leap February: fires on the 29th, not the 28th.
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2024-02-29'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2024-02-28'), $this->anyHijri()));

        // 30-day month: fires on the 30th.
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-04-30'), $this->anyHijri()));

        // 31-day month: fires on the 31st only.
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-05-31'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-05-30'), $this->anyHijri()));
    }

    // --- yearly ---

    public function test_yearly_matches_month_and_day(): void
    {
        $rule = ['freq' => 'yearly', 'month' => 6, 'day' => 12];

        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-12'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-06-13'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-07-12'), $this->anyHijri()));
    }

    public function test_yearly_feb_29_clamps_in_non_leap_years(): void
    {
        $rule = ['freq' => 'yearly', 'month' => 2, 'day' => 29];

        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2024-02-29'), $this->anyHijri()));
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-02-28'), $this->anyHijri()));
    }

    // --- hijri_monthly ---

    public function test_hijri_monthly_matches_white_days(): void
    {
        $rule = ['freq' => 'hijri_monthly', 'hijri_days' => [13, 14, 15]];
        $date = CarbonImmutable::parse('2026-06-12'); // Gregorian date irrelevant here

        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 1, 13)));
        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 1, 14)));
        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 1, 15)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1448, 1, 16)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1448, 1, 12)));
    }

    public function test_hijri_monthly_day_30_clamps_in_29_day_month(): void
    {
        $rule = ['freq' => 'hijri_monthly', 'hijri_days' => [30]];
        $date = CarbonImmutable::parse('2026-06-12');

        // 29-day month: fires on day 29.
        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 1, 29, 29)));
        // 30-day month: fires on day 30 only.
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1448, 2, 29, 30)));
        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 2, 30, 30)));
    }

    // --- hijri_yearly ---

    public function test_hijri_yearly_whole_month_matches_all_of_ramadan(): void
    {
        $rule = ['freq' => 'hijri_yearly', 'hijri_month' => 9];
        $date = CarbonImmutable::parse('2026-06-12');

        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 9, 1)));
        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1448, 9, 30)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1448, 8, 30)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1448, 10, 1)));
    }

    public function test_hijri_yearly_specific_day_arafah(): void
    {
        $rule = ['freq' => 'hijri_yearly', 'hijri_month' => 12, 'hijri_day' => 9];
        $date = CarbonImmutable::parse('2026-06-12');

        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1447, 12, 9)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1447, 12, 10)));
    }

    public function test_hijri_yearly_day_30_clamps_in_29_day_month(): void
    {
        $rule = ['freq' => 'hijri_yearly', 'hijri_month' => 12, 'hijri_day' => 30];
        $date = CarbonImmutable::parse('2026-06-12');

        $this->assertTrue($this->engine->matches($rule, $date, $this->hijri(1447, 12, 29, 29)));
        $this->assertFalse($this->engine->matches($rule, $date, $this->hijri(1447, 12, 29, 30)));
    }

    // --- interval ---

    public function test_interval_every_3_days_from_start(): void
    {
        $rule = ['freq' => 'interval', 'every_days' => 3, 'starts_on' => '2026-06-01'];

        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-01'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-06-02'), $this->anyHijri()));
        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-06-03'), $this->anyHijri()));
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-04'), $this->anyHijri()));
        $this->assertTrue($this->engine->matches($rule, CarbonImmutable::parse('2026-06-07'), $this->anyHijri()));
    }

    public function test_interval_does_not_match_before_start(): void
    {
        $rule = ['freq' => 'interval', 'every_days' => 3, 'starts_on' => '2026-06-01'];

        $this->assertFalse($this->engine->matches($rule, CarbonImmutable::parse('2026-05-29'), $this->anyHijri()));
    }

    public function test_interval_without_start_throws(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->engine->matches(
            ['freq' => 'interval', 'every_days' => 3],
            CarbonImmutable::parse('2026-06-01'),
            $this->anyHijri(),
        );
    }

    // --- general ---

    public function test_unknown_freq_throws(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->engine->matches(['freq' => 'bogus'], CarbonImmutable::parse('2026-06-12'), $this->anyHijri());
    }

    public function test_matches_is_pure_repeated_calls_same_result(): void
    {
        $rule = ['freq' => 'weekly', 'days' => ['fri']];
        $date = CarbonImmutable::parse('2026-06-12');

        $first = $this->engine->matches($rule, $date, $this->anyHijri());
        $second = $this->engine->matches($rule, $date, $this->anyHijri());

        $this->assertSame($first, $second);
        $this->assertTrue($first);
    }
}
