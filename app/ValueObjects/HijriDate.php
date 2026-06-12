<?php

namespace App\ValueObjects;

final readonly class HijriDate
{
    public function __construct(
        public int $year,
        public int $month,
        public int $day,
        public int $monthLength,
    ) {}
}
