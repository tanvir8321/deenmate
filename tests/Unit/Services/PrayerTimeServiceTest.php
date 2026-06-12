<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\PrayerTimeService;
use App\ValueObjects\PrayerTimes;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PrayerTimeServiceTest extends TestCase
{
    private const TOLERANCE_MINUTES = 2;

    private PrayerTimeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PrayerTimeService;
    }

    /**
     * Reference values from AlAdhan (api.aladhan.com), which implements the
     * same published PrayTimes algorithms. Tolerance ±2 minutes per PLAN.md.
     *
     * @return array<string, array{0: array{lat: float, lng: float, tz: string, method: string, asr: string, hlr: string}, 1: string, 2: array<string, string>}>
     */
    public static function fixtureProvider(): array
    {
        $dhaka = ['lat' => 23.8103, 'lng' => 90.4125, 'tz' => 'Asia/Dhaka', 'method' => 'karachi', 'asr' => 'hanafi', 'hlr' => 'none'];
        // AlAdhan applies angle-based high-latitude adjustment by default; required for London in summer.
        $london = ['lat' => 51.5074, 'lng' => -0.1278, 'tz' => 'Europe/London', 'method' => 'isna', 'asr' => 'standard', 'hlr' => 'angle_based'];
        $jakarta = ['lat' => -6.2088, 'lng' => 106.8456, 'tz' => 'Asia/Jakarta', 'method' => 'mwl', 'asr' => 'standard', 'hlr' => 'none'];

        return [
            'Dhaka karachi/hanafi summer' => [$dhaka, '2026-06-12', [
                'fajr' => '03:43', 'sunrise' => '05:11', 'dhuhr' => '11:58',
                'asr' => '16:38', 'maghrib' => '18:46', 'isha' => '20:13',
            ]],
            'Dhaka karachi/hanafi winter' => [$dhaka, '2026-01-15', [
                'fajr' => '05:23', 'sunrise' => '06:43', 'dhuhr' => '12:08',
                'asr' => '15:56', 'maghrib' => '17:33', 'isha' => '18:52',
            ]],
            'London isna/standard summer (BST)' => [$london, '2026-06-12', [
                'fajr' => '02:52', 'sunrise' => '04:43', 'dhuhr' => '13:00',
                'asr' => '17:22', 'maghrib' => '21:18', 'isha' => '23:09',
            ]],
            'London isna/standard winter (GMT)' => [$london, '2026-01-15', [
                'fajr' => '06:19', 'sunrise' => '08:00', 'dhuhr' => '12:10',
                'asr' => '13:59', 'maghrib' => '16:21', 'isha' => '18:01',
            ]],
            'Jakarta mwl/standard summer' => [$jakarta, '2026-06-12', [
                'fajr' => '04:45', 'sunrise' => '05:59', 'dhuhr' => '11:52',
                'asr' => '15:15', 'maghrib' => '17:45', 'isha' => '18:56',
            ]],
            'Jakarta mwl/standard winter' => [$jakarta, '2026-01-15', [
                'fajr' => '04:34', 'sunrise' => '05:49', 'dhuhr' => '12:02',
                'asr' => '15:26', 'maghrib' => '18:15', 'isha' => '19:26',
            ]],
        ];
    }

    /**
     * @param  array{lat: float, lng: float, tz: string, method: string, asr: string, hlr: string}  $location
     * @param  array<string, string>  $expected
     */
    #[DataProvider('fixtureProvider')]
    public function test_matches_published_fixtures(array $location, string $date, array $expected): void
    {
        $times = $this->service->calculate(
            $location['lat'],
            $location['lng'],
            $location['tz'],
            CarbonImmutable::parse($date, $location['tz']),
            $location['method'],
            $location['asr'],
            $location['hlr'],
        );

        foreach ($expected as $prayer => $expectedTime) {
            $actual = $times->{$prayer};
            $target = CarbonImmutable::parse("{$date} {$expectedTime}", $location['tz']);
            $diff = abs($actual->diffInMinutes($target, false));

            $this->assertLessThanOrEqual(
                self::TOLERANCE_MINUTES,
                $diff,
                "{$prayer} expected {$expectedTime}, got {$actual->format('H:i')} (off by {$diff} min)",
            );
        }
    }

    public function test_hanafi_asr_is_later_than_standard(): void
    {
        $date = CarbonImmutable::parse('2026-06-12', 'Asia/Dhaka');
        $standard = $this->service->calculate(23.8103, 90.4125, 'Asia/Dhaka', $date, 'karachi', 'standard');
        $hanafi = $this->service->calculate(23.8103, 90.4125, 'Asia/Dhaka', $date, 'karachi', 'hanafi');

        $this->assertTrue($hanafi->asr->greaterThan($standard->asr));
    }

    public function test_umm_al_qura_isha_is_90_minutes_after_maghrib(): void
    {
        $date = CarbonImmutable::parse('2026-06-12', 'Asia/Riyadh');
        $times = $this->service->calculate(21.4225, 39.8262, 'Asia/Riyadh', $date, 'umm_al_qura');

        $this->assertSame(90.0, $times->maghrib->diffInMinutes($times->isha));
    }

    public function test_all_methods_produce_ordered_times(): void
    {
        $date = CarbonImmutable::parse('2026-03-20', 'Asia/Dhaka');

        foreach (['mwl', 'isna', 'egypt', 'karachi', 'umm_al_qura', 'tehran', 'gulf', 'moonsighting'] as $method) {
            $times = $this->service->calculate(23.8103, 90.4125, 'Asia/Dhaka', $date, $method);

            $this->assertTrue($times->fajr->lessThan($times->sunrise), "{$method}: fajr < sunrise");
            $this->assertTrue($times->sunrise->lessThan($times->dhuhr), "{$method}: sunrise < dhuhr");
            $this->assertTrue($times->dhuhr->lessThan($times->asr), "{$method}: dhuhr < asr");
            $this->assertTrue($times->asr->lessThan($times->maghrib), "{$method}: asr < maghrib");
            $this->assertTrue($times->maghrib->lessThan($times->isha), "{$method}: maghrib < isha");
        }
    }

    public function test_high_latitude_rules_resolve_undefined_times(): void
    {
        // Tromsø, Norway in midsummer: sun never sets far enough for 18° twilight.
        $date = CarbonImmutable::parse('2026-06-21', 'Europe/Oslo');

        foreach (['middle_of_night', 'one_seventh', 'angle_based'] as $rule) {
            $times = $this->service->calculate(69.6492, 18.9553, 'Europe/Oslo', $date, 'mwl', 'standard', $rule);

            $this->assertInstanceOf(PrayerTimes::class, $times);
            $this->assertTrue($times->fajr->lessThan($times->dhuhr), "{$rule}: fajr before dhuhr");
            $this->assertTrue($times->isha->greaterThan($times->dhuhr), "{$rule}: isha after dhuhr");
        }
    }

    public function test_high_latitude_one_seventh_isha_within_first_seventh_of_night(): void
    {
        $date = CarbonImmutable::parse('2026-06-21', 'Europe/Oslo');
        $times = $this->service->calculate(69.6492, 18.9553, 'Europe/Oslo', $date, 'mwl', 'standard', 'one_seventh');

        $nightMinutes = $times->maghrib->diffInMinutes($times->fajr->addDay());
        $ishaOffset = $times->maghrib->diffInMinutes($times->isha);

        $this->assertLessThanOrEqual($nightMinutes / 7 + 2, $ishaOffset);
    }

    public function test_unknown_method_throws(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->service->calculate(0, 0, 'UTC', CarbonImmutable::parse('2026-06-12'), 'bogus');
    }

    public function test_next_returns_dhuhr_midday(): void
    {
        $user = new User([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
        ]);

        $at = CarbonImmutable::parse('2026-06-12 08:00', 'Asia/Dhaka');
        $next = $this->service->next($user, $at);

        $this->assertSame('dhuhr', $next['name']);
        $this->assertTrue($next['at']->isAfter($at));
    }

    public function test_next_rolls_to_fajr_tomorrow_after_isha(): void
    {
        $user = new User([
            'timezone' => 'Asia/Dhaka',
            'lat' => 23.8103,
            'lng' => 90.4125,
            'geohash' => 'wh0r3q',
            'calc_method' => 'karachi',
            'asr_method' => 'hanafi',
            'high_lat_rule' => 'none',
        ]);

        $at = CarbonImmutable::parse('2026-06-12 23:00', 'Asia/Dhaka');
        $next = $this->service->next($user, $at);

        $this->assertSame('fajr', $next['name']);
        $this->assertTrue($next['at']->isAfter($at->endOfDay()));
    }

    public function test_next_returns_null_without_location(): void
    {
        $user = new User([
            'timezone' => 'UTC',
            'lat' => null,
            'lng' => null,
        ]);

        $this->assertNull($this->service->next($user));
    }
}
