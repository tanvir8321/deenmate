<?php

namespace App\Console\Commands;

use App\Actions\MarkMissedTasks;
use App\Actions\RecomputeQadaCounters;
use App\Models\User;
use App\Services\ReminderScheduler;
use App\Services\StreakService;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

/**
 * Runs hourly. Finds timezones that just passed local midnight and,
 * for each user there: marks yesterday's uncompleted reminder-enabled
 * items missed, busts caches, refreshes streaks, precomputes today's reminders.
 */
class RolloverDay extends Command
{
    protected $signature = 'day:rollover {--tz= : Only process this timezone (testing)}';

    protected $description = 'Mark missed tasks and refresh streaks for timezones that just passed midnight';

    public function handle(
        MarkMissedTasks $markMissed,
        StreakService $streaks,
        ReminderScheduler $scheduler,
        RecomputeQadaCounters $recomputeQada,
    ): int {
        $nowUtc = CarbonImmutable::now('UTC');
        $only = $this->option('tz');

        $timezones = $only !== null
            ? [$only]
            : User::query()->distinct()->pluck('timezone')->all();

        $processed = 0;

        foreach ($timezones as $tz) {
            $local = $nowUtc->setTimezone($tz);

            // Only the hour right after local midnight.
            if ($only === null && $local->hour !== 0) {
                continue;
            }

            $yesterday = $local->subDay()->startOfDay();
            $today = $local->startOfDay();

            User::query()
                ->where('timezone', $tz)
                ->chunkById(200, function ($users) use ($markMissed, $streaks, $scheduler, $recomputeQada, $yesterday, $today, &$processed) {
                    foreach ($users as $user) {
                        $missed = $markMissed($user, $yesterday);

                        TodayResolver::bust($user->id, $yesterday->toDateString());
                        TodayResolver::bust($user->id, $today->toDateString());
                        StreakService::bust($user->id, $yesterday->toDateString());
                        StreakService::bust($user->id, $today->toDateString());

                        // Recompute qada counters from raw logs.
                        $recomputeQada($user, $today);

                        // Warm today's streak cache.
                        $streaks->global($user, $today);

                        // Precompute today's reminders.
                        $scheduler->scheduleForDate($user, $today);

                        $processed++;

                        if ($missed > 0) {
                            $this->line("user {$user->id}: {$missed} missed");
                        }
                    }
                });
        }

        $this->info("Rollover complete: {$processed} users processed.");

        return self::SUCCESS;
    }
}
