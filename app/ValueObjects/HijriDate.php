<?php

namespace App\ValueObjects;

use Stringable;

final readonly class HijriDate implements Stringable
{
    public function __construct(
        public int $year,
        public int $month,
        public int $day,
        public int $monthLength,
    ) {}

    public function __toString(): string
    {
        return sprintf('%04d-%02d-%02d', $this->year, $this->month, $this->day);
    }

    public function format(string $format): string
    {
        $map = [
            '%d' => sprintf('%02d', $this->day),
            '%B' => $this->monthName(),
            '%m' => sprintf('%02d', $this->month),
            '%Y' => sprintf('%04d', $this->year),
        ];

        return str_replace(array_keys($map), array_values($map), $format);
    }

    private function monthName(): string
    {
        $months = [
            1 => 'Muharram',
            2 => 'Safar',
            3 => "Rabi' al-Awwal",
            4 => "Rabi' al-Thani",
            5 => 'Jumada al-Ula',
            6 => 'Jumada al-Akhirah',
            7 => 'Rajab',
            8 => "Sha'ban",
            9 => 'Ramadan',
            10 => 'Shawwal',
            11 => "Dhul-Qa'dah",
            12 => 'Dhul-Hijjah',
        ];

        return $months[$this->month] ?? '';
    }
}
