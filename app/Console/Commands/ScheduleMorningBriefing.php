<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\MorningBriefingNotification;
use App\Services\PrayerTimeService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

/**
 * Precomputes MorningBriefingNotification for all users.
 * Runs during day:rollover or on-demand.
 * Dispatches at Fajr+30 local time.
 */
class ScheduleMorningBriefing extends Command
{
    protected $signature = 'briefing:schedule {--date= : ISO date Y-m-d (default today UTC)}';

    protected $description = 'Schedule MorningBriefing notifications for all users';

    public function handle(PrayerTimeService $prayerTimes): int
    {
        $dateStr = $this->option('date') ?? CarbonImmutable::now('UTC')->toDateString();
        $scheduled = 0;

        User::query()
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->chunkById(200, function ($users) use ($prayerTimes, $dateStr, &$scheduled) {
                foreach ($users as $user) {
                    try {
                        $today = CarbonImmutable::parse($dateStr, 'UTC')->setTimezone($user->timezone)->startOfDay();
                        $times = $prayerTimes->times($user, $today);

                        // Fajr + 30 minutes.
                        $fajrPlus30 = $times->fajr->addMinutes(30);
                        $fajrPlus30Utc = $fajrPlus30->setTimezone('UTC');

                        $hourKey = $fajrPlus30Utc->format('Y-m-d-H');
                        $score = $fajrPlus30Utc->timestamp;

                        $payload = json_encode([
                            'user_id' => $user->id,
                            'type' => 'morning_briefing',
                            'scheduled_at' => $fajrPlus30Utc->toIso8601String(),
                        ]);

                        Redis::zadd("reminders:{$hourKey}", $score, $payload);
                        $scheduled++;
                    } catch (\Throwable) {
                        // Skip users with invalid location.
                    }
                }
            });

        $this->info("Scheduled morning briefings for {$scheduled} users.");

        return self::SUCCESS;
    }
}
