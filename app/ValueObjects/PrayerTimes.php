<?php

namespace App\ValueObjects;

use Carbon\CarbonImmutable;

final readonly class PrayerTimes
{
    public function __construct(
        public CarbonImmutable $fajr,
        public CarbonImmutable $sunrise,
        public CarbonImmutable $dhuhr,
        public CarbonImmutable $asr,
        public CarbonImmutable $maghrib,
        public CarbonImmutable $isha,
    ) {}

    /**
     * @return array<string, CarbonImmutable>
     */
    public function times(): array
    {
        return [
            'fajr' => $this->fajr,
            'sunrise' => $this->sunrise,
            'dhuhr' => $this->dhuhr,
            'asr' => $this->asr,
            'maghrib' => $this->maghrib,
            'isha' => $this->isha,
        ];
    }

    /**
     * @return list<array{key: string, label: string, time: CarbonImmutable}>
     */
    public function namedTimes(): array
    {
        return [
            ['key' => 'fajr', 'label' => 'Fajr', 'time' => $this->fajr],
            ['key' => 'sunrise', 'label' => 'Sunrise', 'time' => $this->sunrise],
            ['key' => 'dhuhr', 'label' => 'Dhuhr', 'time' => $this->dhuhr],
            ['key' => 'asr', 'label' => 'Asr', 'time' => $this->asr],
            ['key' => 'maghrib', 'label' => 'Maghrib', 'time' => $this->maghrib],
            ['key' => 'isha', 'label' => 'Isha', 'time' => $this->isha],
        ];
    }

    public function nextPrayer(string $currentTime): string
    {
        $now = CarbonImmutable::parse($currentTime);
        foreach (['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as $key) {
            if ($now < $this->$key) {
                return $key;
            }
        }

        return 'fajr';
    }

    public function minutesUntilNextPrayer(string $currentTime): int
    {
        $next = $this->nextPrayer($currentTime);

        return (int) CarbonImmutable::parse($currentTime)->diffInMinutes($this->$next, false);
    }
}
