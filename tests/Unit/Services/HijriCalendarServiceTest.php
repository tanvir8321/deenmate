<?php

namespace Tests\Unit\Services;

use App\Services\HijriCalendarService;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class HijriCalendarServiceTest extends TestCase
{
    private HijriCalendarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new HijriCalendarService;
    }

    public function test_to_hijri_returns_hijri_array(): void
    {
        $result = $this->service->toHijri(CarbonImmutable::parse('2026-06-12'));

        $this->assertArrayHasKey('year', $result);
        $this->assertArrayHasKey('month', $result);
        $this->assertArrayHasKey('day', $result);
    }

    public function test_june_2026_is_dhul_hijjah_1447(): void
    {
        $result = $this->service->toHijri(CarbonImmutable::parse('2026-06-12'));

        $this->assertEquals(1447, $result['year']);
        $this->assertEquals(12, $result['month']);
        $this->assertEquals(26, $result['day']);
    }

    public function test_to_hijri_valid_ranges(): void
    {
        $result = $this->service->toHijri(CarbonImmutable::parse('2026-06-12'));

        $this->assertGreaterThanOrEqual(1, $result['day']);
        $this->assertLessThanOrEqual(30, $result['day']);
        $this->assertGreaterThanOrEqual(1, $result['month']);
        $this->assertLessThanOrEqual(12, $result['month']);
    }

    public function test_to_gregorian_dhul_qaidah_1447(): void
    {
        $gregorian = $this->service->toGregorian(1447, 11, 18);

        $this->assertInstanceOf(CarbonImmutable::class, $gregorian);
        $this->assertEquals(2026, $gregorian->year);
        $this->assertEquals(5, $gregorian->month);
        $this->assertEquals(5, $gregorian->day);
    }

    public function test_to_gregorian_ramadan_1447(): void
    {
        $gregorian = $this->service->toGregorian(1447, 9, 1);

        $this->assertInstanceOf(CarbonImmutable::class, $gregorian);
        $this->assertEquals(2026, $gregorian->year);
        $this->assertEquals(2, $gregorian->month);
        $this->assertEquals(18, $gregorian->day);
    }

    public function test_round_trip_dhul_qaidah(): void
    {
        $hijri = ['year' => 1447, 'month' => 11, 'day' => 18];
        $gregorian = $this->service->toGregorian($hijri['year'], $hijri['month'], $hijri['day']);

        $this->assertInstanceOf(CarbonImmutable::class, $gregorian);
        $back = $this->service->toHijri($gregorian);
        $this->assertEquals($hijri['year'], $back['year']);
        $this->assertEquals($hijri['month'], $back['month']);
        $this->assertEquals($hijri['day'], $back['day']);
    }

    public function test_round_trip_ramadan(): void
    {
        $hijri = ['year' => 1447, 'month' => 9, 'day' => 15];
        $gregorian = $this->service->toGregorian($hijri['year'], $hijri['month'], $hijri['day']);

        $back = $this->service->toHijri($gregorian);
        $this->assertEquals($hijri['year'], $back['year']);
        $this->assertEquals($hijri['month'], $back['month']);
        $this->assertEquals($hijri['day'], $back['day']);
    }

    public function test_hijri_month_length_29_or_30(): void
    {
        $len = $this->service->hijriMonthLength(1447, 1);
        $this->assertContains($len, [29, 30]);
    }

    public function test_is_ramadan_true_in_ramadan(): void
    {
        $ramadan = $this->service->toGregorian(1447, 9, 15);
        $this->assertTrue($this->service->isRamadan($ramadan));
    }

    public function test_is_ramadan_false_outside_ramadan(): void
    {
        $outside = CarbonImmutable::parse('2026-06-12');
        $this->assertFalse($this->service->isRamadan($outside));
    }

    public function test_offset_plus_one_shifts_day(): void
    {
        $date = CarbonImmutable::parse('2026-06-12');
        $base = $this->service->toHijri($date);
        $adj = $this->service->toHijriWithOffset($date, 1);

        $this->assertEquals($base['day'] + 1, $adj['day']);
        $this->assertEquals($base['year'], $adj['year']);
        $this->assertEquals($base['month'], $adj['month']);
    }

    public function test_offset_zero_equals_base(): void
    {
        $date = CarbonImmutable::parse('2026-06-12');
        $base = $this->service->toHijri($date);
        $zero = $this->service->toHijriWithOffset($date, 0);

        $this->assertEquals($base['year'], $zero['year']);
        $this->assertEquals($base['month'], $zero['month']);
        $this->assertEquals($base['day'], $zero['day']);
    }

    public function test_month_lengths_vary(): void
    {
        $lengths = array_map(fn ($m) => $this->service->hijriMonthLength(1447, $m), range(1, 12));

        $this->assertContains(30, $lengths);
        $this->assertContains(29, $lengths);
    }

    public function test_ramadan_1447_is_ramadan_month(): void
    {
        $ramadan = $this->service->toGregorian(1447, 9, 1);
        $hijri = $this->service->toHijri($ramadan);

        $this->assertEquals(9, $hijri['month']);
        $this->assertEquals(1, $hijri['day']);
    }

    public function test_is_ramadan_with_offset(): void
    {
        $ramadan = $this->service->toGregorian(1447, 9, 30);
        $this->assertTrue($this->service->isRamadan($ramadan, 0));
        $this->assertFalse($this->service->isRamadan($ramadan, 1));
    }
}
