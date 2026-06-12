<?php

namespace App\Services\Reminders;

use App\Models\Routine;
use App\Models\User;
use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use App\Services\RecurrenceEngine;
use App\Services\TodayResolver;
use App\ValueObjects\PrayerTimes;
use Carbon\CarbonImmutable;

/**
 * Precomputes a user's reminder times for one local day into the
 * ReminderStore as concrete UTC timestamps. Runs during day:rollover.
 */
class ReminderScheduler
{
    public const ANYTIME_REMINDER_HOUR = 9;

    public const BRIEFING_OFFSET_MINUTES = 30;

    public function __construct(
        private readonly RecurrenceEngine $recurrence,
        private readonly HijriCalendarService $hijri,
        private readonly PrayerTimeService $prayerTimes,
        private readonly TodayResolver $resolver,
        private readonly ReminderStore $store,
    ) {}

    /**
     * @return int number of reminders scheduled
     */
    public function scheduleForUser(User $user, CarbonImmutable $localDate): int
    {
        $localDate = $localDate->startOfDay();
        $hijriDate = $this->hijri->hijriDate($localDate, $user->hijri_offset);

        $times = null;
        if ($user->lat !== null && $user->lng !== null) {
            $times = $this->prayerTimes->times($user, $localDate);
        }

        $count = 0;

        // Morning briefing at Fajr + 30 (skipped without location).
        if ($times !== null) {
            $briefingAt = $times->fajr->addMinutes(self::BRIEFING_OFFSET_MINUTES);
            if ($briefingAt->isFuture()) {
                $this->store->add([
                    'kind' => 'briefing',
                    'user_id' => $user->id,
                    'date' => $localDate->toDateString(),
                ], $briefingAt->getTimestamp());
                $count++;
            }
        }

        $routines = Routine::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->where('reminder_enabled', true)
            ->whereDate('starts_on', '<=', $localDate->toDateString())
            ->where(fn ($q) => $q->whereNull('ends_on')->orWhereDate('ends_on', '>=', $localDate->toDateString()))
            ->get();

        foreach ($routines as $routine) {
            $rule = $routine->recurrence;
            if (($rule['freq'] ?? null) === 'interval') {
                $rule['starts_on'] = $routine->starts_on->toDateString();
            }

            if (! $this->recurrence->matches($rule, $localDate, $hijriDate)) {
                continue;
            }

            $dueAt = $this->dueAt($routine, $localDate, $times);

            if ($dueAt->isPast()) {
                continue;
            }

            $this->store->add([
                'kind' => 'task',
                'user_id' => $user->id,
                'routine_id' => $routine->id,
                'date' => $localDate->toDateString(),
                'attempt' => 0,
            ], $dueAt->getTimestamp());
            $count++;
        }

        return $count;
    }

    private function dueAt(Routine $routine, CarbonImmutable $localDate, ?PrayerTimes $times): CarbonImmutable
    {
        return $this->resolver->resolveDueAt($routine, $localDate, $times)
            ?? $localDate->setTime(self::ANYTIME_REMINDER_HOUR, 0);
    }
}
