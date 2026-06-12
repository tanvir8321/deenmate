<?php

namespace App\Services;

use App\ValueObjects\HijriDate;
use Carbon\CarbonImmutable;
use IslamicNetwork\Calendar\Models\Date\Hijri;
use IslamicNetwork\Calendar\Models\Mathematical\Calculator;

class HijriCalendarService
{
    private Calculator $calculator;

    public function __construct()
    {
        $this->calculator = new Calculator;
    }

    /**
     * @return array{year: int, month: int, day: int}
     */
    public function toHijri(CarbonImmutable $date): array
    {
        $result = $this->calculator->gToH($date->format('d-m-Y'), 0);

        return [
            'year' => (int) $result->year,
            'month' => (int) $result->month->number,
            'day' => (int) $result->day->number,
        ];
    }

    /**
     * @return array{year: int, month: int, day: int}
     */
    public function toHijriWithOffset(CarbonImmutable $date, int $offsetDays): array
    {
        $result = $this->calculator->gToH($date->format('d-m-Y'), $offsetDays);

        return [
            'year' => (int) $result->year,
            'month' => (int) $result->month->number,
            'day' => (int) $result->day->number,
        ];
    }

    public function hijriDate(CarbonImmutable $date, int $offsetDays = 0): HijriDate
    {
        $h = $this->toHijriWithOffset($date, $offsetDays);

        return new HijriDate(
            year: $h['year'],
            month: $h['month'],
            day: $h['day'],
            monthLength: $this->hijriMonthLength($h['year'], $h['month']),
        );
    }

    public function toGregorian(int $year, int $month, int $day): CarbonImmutable
    {
        $dateStr = sprintf('%02d-%02d-%04d', $day, $month, $year);
        $dt = $this->calculator->hToG($dateStr, 0);

        return CarbonImmutable::createFromFormat('d-m-Y', $dt->format('d-m-Y'))->startOfDay();
    }

    public function hijriMonthLength(int $year, int $month): int
    {
        $jd1 = $this->islamicToJd($year, $month, 1);
        $jd2 = $this->islamicToJd($month === 12 ? $year + 1 : $year, $month === 12 ? 1 : $month + 1, 1);

        return (int) ($jd2 - $jd1);
    }

    public function isRamadan(CarbonImmutable $date, int $offset = 0): bool
    {
        return $this->toHijriWithOffset($date, $offset)['month'] === 9;
    }

    public function event(CarbonImmutable $date, int $offset = 0): ?string
    {
        $h = $this->toHijriWithOffset($date, $offset);
        $m = $h['month'];
        $d = $h['day'];

        return match (true) {
            $m === 1 && $d === 1 => 'Islamic New Year',
            $m === 1 && $d === 10 => 'Ashura',
            $m === 3 && $d === 12 => 'Mawlid (Prophet\'s Birthday)',
            $m === 7 && $d === 27 => 'Laylat al-Miraj',
            $m === 8 && $d === 15 => 'Laylat al-Mubarak (Mid-Shaban)',
            $m === 9 && $d === 1 => 'First Day of Ramadan',
            $m === 9 && $d === 27 => 'Laylat al-Qadr',
            $m === 10 && $d === 1 => 'Eid al-Fitr',
            $m === 12 && $d === 9 => 'Day of Arafah',
            $m === 12 && $d === 10 => 'Eid al-Adha',
            default => null,
        };
    }

    private function islamicToJd(int $year, int $month, int $day): float
    {
        $dateStr = sprintf('%02d-%02d-%04d', $day, $month, $year);
        $hd = new Hijri($dateStr);

        return $hd->toJulian(0);
    }
}
