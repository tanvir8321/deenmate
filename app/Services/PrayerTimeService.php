<?php

namespace App\Services;

use App\Models\PrayerTimesCache;
use App\Models\User;
use App\Support\Geohash;
use App\ValueObjects\PrayerTimes;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

/**
 * Pure-PHP prayer time calculation (port of the PrayTimes.org algorithm).
 * All lookups cached in prayer_times_cache by (date, geohash6, method, asr_method, high_lat_rule).
 * No runtime third-party API calls — ever.
 */
class PrayerTimeService
{
    /**
     * Method parameters: fajr angle, isha angle OR isha minutes after maghrib,
     * maghrib angle (Tehran only — others use sunset).
     *
     * @var array<string, array{fajr: float, isha?: float, isha_min?: int, maghrib_angle?: float}>
     */
    private const METHODS = [
        'mwl' => ['fajr' => 18.0, 'isha' => 17.0],
        'isna' => ['fajr' => 15.0, 'isha' => 15.0],
        'egypt' => ['fajr' => 19.5, 'isha' => 17.5],
        'karachi' => ['fajr' => 18.0, 'isha' => 18.0],
        'umm_al_qura' => ['fajr' => 18.5, 'isha_min' => 90],
        'tehran' => ['fajr' => 17.7, 'isha' => 14.0, 'maghrib_angle' => 4.5],
        'gulf' => ['fajr' => 19.5, 'isha_min' => 90],
        'moonsighting' => ['fajr' => 18.0, 'isha' => 18.0],
    ];

    public function times(User $user, CarbonImmutable $date): PrayerTimes
    {
        if ($user->lat === null || $user->lng === null) {
            throw new InvalidArgumentException('User has no location set.');
        }

        $geohash = $user->geohash ?? Geohash::encode($user->lat, $user->lng, 6);
        $localDate = $date->setTimezone($user->timezone)->startOfDay();

        $cached = PrayerTimesCache::query()
            ->whereDate('date', $localDate->toDateString())
            ->where('geohash', $geohash)
            ->where('method', $user->calc_method)
            ->where('asr_method', $user->asr_method)
            ->where('high_lat_rule', $user->high_lat_rule)
            ->first();

        if ($cached !== null) {
            return $this->fromStored($cached->times, $localDate);
        }

        $times = $this->calculate(
            $user->lat,
            $user->lng,
            $user->timezone,
            $localDate,
            $user->calc_method,
            $user->asr_method,
            $user->high_lat_rule,
        );

        PrayerTimesCache::query()->upsert([[
            'date' => $localDate->toDateString(),
            'geohash' => $geohash,
            'method' => $user->calc_method,
            'asr_method' => $user->asr_method,
            'high_lat_rule' => $user->high_lat_rule,
            'times' => json_encode($this->toStored($times)),
        ]], ['date', 'geohash', 'method', 'asr_method', 'high_lat_rule'], ['times']);

        return $times;
    }

    public function calculate(
        float $lat,
        float $lng,
        string $timezone,
        CarbonImmutable $date,
        string $method,
        string $asrMethod = 'standard',
        string $highLatRule = 'none',
    ): PrayerTimes {
        if (! isset(self::METHODS[$method])) {
            throw new InvalidArgumentException("Unknown calculation method [{$method}].");
        }

        $params = self::METHODS[$method];
        $localDate = $date->setTimezone($timezone)->startOfDay();
        $tzOffset = $localDate->offsetMinutes / 60.0;

        $jdate = $this->julian($localDate->year, $localDate->month, $localDate->day) - $lng / (15.0 * 24.0);

        // Initial day-portion estimates, then one refinement pass (PrayTimes default).
        $t = ['fajr' => 5, 'sunrise' => 6, 'dhuhr' => 12, 'asr' => 13, 'sunset' => 18, 'maghrib' => 18, 'isha' => 18];
        $t = array_map(fn ($v) => $v / 24.0, $t);

        $asrFactor = $asrMethod === 'hanafi' ? 2.0 : 1.0;
        $riseSetAngle = 0.833;

        $t['fajr'] = $this->sunAngleTime($jdate, $lat, $params['fajr'], $t['fajr'], true);
        $t['sunrise'] = $this->sunAngleTime($jdate, $lat, $riseSetAngle, $t['sunrise'], true);
        $t['dhuhr'] = $this->midDay($jdate, $t['dhuhr']);
        $t['asr'] = $this->asrTime($jdate, $lat, $asrFactor, $t['asr']);
        $t['sunset'] = $this->sunAngleTime($jdate, $lat, $riseSetAngle, $t['sunset'], false);
        $t['maghrib'] = isset($params['maghrib_angle'])
            ? $this->sunAngleTime($jdate, $lat, $params['maghrib_angle'], $t['maghrib'], false)
            : $t['sunset'];
        $t['isha'] = isset($params['isha'])
            ? $this->sunAngleTime($jdate, $lat, $params['isha'], $t['isha'], false)
            : NAN;

        // Convert from solar to local clock time.
        foreach ($t as $key => $value) {
            $t[$key] = $value + $tzOffset - $lng / 15.0;
        }

        if ($highLatRule !== 'none') {
            $t = $this->adjustHighLatitudes($t, $params, $highLatRule);
        }

        if (isset($params['isha_min'])) {
            $t['isha'] = $t['maghrib'] + $params['isha_min'] / 60.0;
        }

        // Fall back when angle-based times are undefined (perpetual day/night) and no rule chosen.
        foreach (['fajr' => -1, 'sunrise' => -1, 'isha' => 1, 'maghrib' => 1] as $key => $dir) {
            if (is_nan($t[$key])) {
                $base = $dir === -1 ? $t['dhuhr'] - 6 : $t['dhuhr'] + 6;
                $t[$key] = $base;
            }
        }

        return new PrayerTimes(
            fajr: $this->toTime($localDate, $t['fajr']),
            sunrise: $this->toTime($localDate, $t['sunrise']),
            dhuhr: $this->toTime($localDate, $t['dhuhr']),
            asr: $this->toTime($localDate, $t['asr']),
            maghrib: $this->toTime($localDate, $t['maghrib']),
            isha: $this->toTime($localDate, $t['isha']),
        );
    }

    /**
     * @param  array<string, float>  $times
     * @param  array{fajr: float, isha?: float, isha_min?: int, maghrib_angle?: float}  $params
     * @return array<string, float>
     */
    private function adjustHighLatitudes(array $times, array $params, string $rule): array
    {
        $night = $this->fixHour($times['sunrise'] - $times['sunset']);

        $times['fajr'] = $this->adjustHighLatTime($times['fajr'], $times['sunrise'], $params['fajr'], $night, $rule, true);

        if (isset($params['isha'])) {
            $times['isha'] = $this->adjustHighLatTime($times['isha'], $times['sunset'], $params['isha'], $night, $rule, false);
        }
        if (isset($params['maghrib_angle'])) {
            $times['maghrib'] = $this->adjustHighLatTime($times['maghrib'], $times['sunset'], $params['maghrib_angle'], $night, $rule, false);
        }

        return $times;
    }

    private function adjustHighLatTime(float $time, float $base, float $angle, float $night, string $rule, bool $ccw): float
    {
        $portion = match ($rule) {
            'middle_of_night' => 0.5,
            'one_seventh' => 1 / 7,
            default => $angle / 60.0,
        } * $night;

        $diff = $ccw ? $this->fixHour($base - $time) : $this->fixHour($time - $base);

        if (is_nan($time) || $diff > $portion) {
            return $base + ($ccw ? -$portion : $portion);
        }

        return $time;
    }

    // ----- Solar astronomy (PrayTimes.org) -----

    private function midDay(float $jdate, float $time): float
    {
        [, $eqt] = $this->sunPosition($jdate + $time);

        return $this->fixHour(12 - $eqt);
    }

    private function sunAngleTime(float $jdate, float $lat, float $angle, float $time, bool $ccw): float
    {
        [$decl] = $this->sunPosition($jdate + $time);
        $noon = $this->midDay($jdate, $time);

        $cosArg = (-$this->dSin($angle) - $this->dSin($decl) * $this->dSin($lat))
            / ($this->dCos($decl) * $this->dCos($lat));

        if ($cosArg > 1 || $cosArg < -1) {
            return NAN;
        }

        $t = (1 / 15.0) * $this->dArcCos($cosArg);

        return $noon + ($ccw ? -$t : $t);
    }

    private function asrTime(float $jdate, float $lat, float $factor, float $time): float
    {
        [$decl] = $this->sunPosition($jdate + $time);
        $angle = -$this->dArcCot($factor + $this->dTan(abs($lat - $decl)));

        return $this->sunAngleTime($jdate, $lat, $angle, $time, false);
    }

    /**
     * @return array{0: float, 1: float} declination (deg), equation of time (hours)
     */
    private function sunPosition(float $jd): array
    {
        $d = $jd - 2451545.0;
        $g = $this->fixAngle(357.529 + 0.98560028 * $d);
        $q = $this->fixAngle(280.459 + 0.98564736 * $d);
        $l = $this->fixAngle($q + 1.915 * $this->dSin($g) + 0.020 * $this->dSin(2 * $g));
        $e = 23.439 - 0.00000036 * $d;

        $ra = $this->dArcTan2($this->dCos($e) * $this->dSin($l), $this->dCos($l)) / 15.0;
        $eqt = $q / 15.0 - $this->fixHour($ra);
        $decl = $this->dArcSin($this->dSin($e) * $this->dSin($l));

        return [$decl, $eqt];
    }

    private function julian(int $year, int $month, int $day): float
    {
        if ($month <= 2) {
            $year -= 1;
            $month += 12;
        }
        $a = intdiv($year, 100);
        $b = 2 - $a + intdiv($a, 4);

        return floor(365.25 * ($year + 4716)) + floor(30.6001 * ($month + 1)) + $day + $b - 1524.5;
    }

    // ----- Helpers -----

    /**
     * @param  array<string, string>  $stored
     */
    private function fromStored(array $stored, CarbonImmutable $localDate): PrayerTimes
    {
        $make = fn (string $key) => $localDate->setTimeFromTimeString($stored[$key]);

        return new PrayerTimes(
            fajr: $make('fajr'),
            sunrise: $make('sunrise'),
            dhuhr: $make('dhuhr'),
            asr: $make('asr'),
            maghrib: $make('maghrib'),
            isha: $make('isha'),
        );
    }

    /**
     * @return array<string, string>
     */
    private function toStored(PrayerTimes $times): array
    {
        return array_map(fn (CarbonImmutable $t) => $t->format('H:i'), $times->times());
    }

    private function toTime(CarbonImmutable $localDate, float $hours): CarbonImmutable
    {
        $hours = $this->fixHour($hours);
        $h = (int) floor($hours);
        $m = (int) round(($hours - $h) * 60);
        if ($m === 60) {
            $h += 1;
            $m = 0;
        }

        return $localDate->setTime($h % 24, $m);
    }

    private function fixAngle(float $a): float
    {
        return $this->fix($a, 360.0);
    }

    private function fixHour(float $h): float
    {
        return $this->fix($h, 24.0);
    }

    private function fix(float $a, float $mod): float
    {
        if (is_nan($a)) {
            return NAN;
        }
        $a = fmod($a, $mod);

        return $a < 0 ? $a + $mod : $a;
    }

    private function dSin(float $d): float
    {
        return sin(deg2rad($d));
    }

    private function dCos(float $d): float
    {
        return cos(deg2rad($d));
    }

    private function dTan(float $d): float
    {
        return tan(deg2rad($d));
    }

    private function dArcSin(float $x): float
    {
        return rad2deg(asin($x));
    }

    private function dArcCos(float $x): float
    {
        return rad2deg(acos($x));
    }

    private function dArcCot(float $x): float
    {
        return rad2deg(atan2(1, $x));
    }

    private function dArcTan2(float $y, float $x): float
    {
        return rad2deg(atan2($y, $x));
    }
}
