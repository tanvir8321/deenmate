<?php

namespace App\Services;

use App\ValueObjects\HijriDate;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

/**
 * ALL recurrence matching goes through here. Pure function — no IO, no clock.
 *
 * Rule formats (PLAN.md §5):
 *   { "freq": "daily" }
 *   { "freq": "weekly", "days": ["mon","thu"] }
 *   { "freq": "monthly", "day_of_month": 1 }
 *   { "freq": "yearly", "month": 6, "day": 12 }
 *   { "freq": "hijri_monthly", "hijri_days": [13,14,15] }
 *   { "freq": "hijri_yearly", "hijri_month": 9 }
 *   { "freq": "hijri_yearly", "hijri_month": 12, "hijri_day": 9 }
 *   { "freq": "interval", "every_days": 3, "starts_on": "2026-01-01" }
 */
class RecurrenceEngine
{
    /**
     * @param  array<string, mixed>  $rule
     */
    public function matches(array $rule, CarbonImmutable $date, HijriDate $hijri): bool
    {
        return match ($rule['freq'] ?? null) {
            'daily' => true,
            'weekly' => $this->matchesWeekly($rule, $date),
            'monthly' => $this->matchesMonthly($rule, $date),
            'yearly' => $this->matchesYearly($rule, $date),
            'hijri_monthly' => $this->matchesHijriMonthly($rule, $hijri),
            'hijri_yearly' => $this->matchesHijriYearly($rule, $hijri),
            'interval' => $this->matchesInterval($rule, $date),
            default => throw new InvalidArgumentException(
                'Unknown recurrence freq ['.var_export($rule['freq'] ?? null, true).'].'
            ),
        };
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesWeekly(array $rule, CarbonImmutable $date): bool
    {
        $days = array_map(strtolower(...), (array) ($rule['days'] ?? []));

        return in_array(strtolower($date->format('D')), $days, true);
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesMonthly(array $rule, CarbonImmutable $date): bool
    {
        $target = (int) ($rule['day_of_month'] ?? 1);

        // Clamp: day 31 in a 30-day month (or Feb) fires on the last day.
        return $date->day === min($target, $date->daysInMonth());
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesYearly(array $rule, CarbonImmutable $date): bool
    {
        if ($date->month !== (int) ($rule['month'] ?? 0)) {
            return false;
        }

        $target = (int) ($rule['day'] ?? 1);

        return $date->day === min($target, $date->daysInMonth());
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesHijriMonthly(array $rule, HijriDate $hijri): bool
    {
        foreach ((array) ($rule['hijri_days'] ?? []) as $day) {
            // Clamp: day 30 in a 29-day Hijri month fires on day 29.
            if ($hijri->day === min((int) $day, $hijri->monthLength)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesHijriYearly(array $rule, HijriDate $hijri): bool
    {
        if ($hijri->month !== (int) ($rule['hijri_month'] ?? 0)) {
            return false;
        }

        if (! isset($rule['hijri_day'])) {
            return true; // whole Hijri month (e.g. all of Ramadan)
        }

        return $hijri->day === min((int) $rule['hijri_day'], $hijri->monthLength);
    }

    /**
     * @param  array<string, mixed>  $rule
     */
    private function matchesInterval(array $rule, CarbonImmutable $date): bool
    {
        $every = (int) ($rule['every_days'] ?? 0);
        $startsOn = $rule['starts_on'] ?? null;

        if ($every < 1 || $startsOn === null) {
            throw new InvalidArgumentException('Interval rule requires every_days >= 1 and starts_on.');
        }

        $start = CarbonImmutable::parse($startsOn)->startOfDay();
        $date = $date->startOfDay();

        if ($date->lessThan($start)) {
            return false;
        }

        return $start->diffInDays($date) % $every === 0;
    }
}
