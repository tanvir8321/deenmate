<?php

namespace App\Console\Commands;

use App\Jobs\SendTaskReminder;
use App\Models\User;
use App\Notifications\MorningBriefingNotification;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Runs every minute. Reads reminders:{current-hour} sorted set,
 * dispatches SendTaskReminder jobs for entries whose score falls
 * within the current minute window.
 * Also handles morning_briefing entries directly.
 */
class DispatchReminders extends Command
{
    protected $signature = 'reminders:dispatch';

    protected $description = 'Dispatch due reminders from the Redis sorted set';

    public function handle(): int
    {
        $now = CarbonImmutable::now('UTC');
        $minuteStart = $now->timestamp;
        $minuteEnd = $now->addMinute()->timestamp;

        $currentHourKey = gmdate('Y-m-d-H', $now->timestamp);
        $key = "reminders:{$currentHourKey}";

        // Also check next hour's key in case of drift near hour boundary.
        $nextHourKey = gmdate('Y-m-d-H', $now->addHour()->timestamp);
        $nextKey = "reminders:{$nextHourKey}";

        $dispatched = 0;

        foreach ([$key, $nextKey] as $k) {
            // Get entries with score in the current minute window.
            /** @var list<string> */
            $entries = Redis::zrangebyscore($k, $minuteStart, $minuteEnd - 1);

            foreach ($entries as $entry) {
                /** @var array<string, mixed> */
                $data = json_decode($entry, true);
                if (! $data) {
                    continue;
                }

                // Remove immediately to prevent double-dispatch.
                Redis::zrem($k, $entry);

                // Skip if already past the minute window (stale).
                $scheduledAt = CarbonImmutable::parse($data['scheduled_at']);
                if ($scheduledAt->timestamp < $minuteStart || $scheduledAt->timestamp >= $minuteEnd) {
                    continue;
                }

                if (($data['type'] ?? null) === 'morning_briefing') {
                    $this->dispatchMorningBriefing($data);
                } else {
                    $this->dispatchTaskReminder($data);
                }

                $dispatched++;
            }
        }

        if ($dispatched > 0) {
            $this->info("Dispatched {$dispatched} reminders.");
        }

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function dispatchTaskReminder(array $data): void
    {
        $nagCount = (int) ($data['nag_count'] ?? 0);

        // If nag mode and not done yet, re-enqueue for +30 min.
        if ($nagCount > 0 && $nagCount < 4) {
            $this->reenqueueNag($data, $nagCount);
        }

        SendTaskReminder::dispatch(
            userId: (int) $data['user_id'],
            routineId: isset($data['routine_id']) ? (int) $data['routine_id'] : null,
            taskInstanceId: isset($data['task_instance_id']) ? (int) $data['task_instance_id'] : null,
            title: (string) $data['title'],
            dedupeKey: (string) $data['dedupe_key'],
            nagCount: $nagCount,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function dispatchMorningBriefing(array $data): void
    {
        $user = User::find((int) $data['user_id']);
        if (! $user) {
            return;
        }

        $user->notify(new MorningBriefingNotification);

        Log::debug('MorningBriefing: dispatched', ['user_id' => $user->id]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function reenqueueNag(array $data, int $nagCount): void
    {
        /** @var string */
        $scheduledAt = $data['scheduled_at'];
        $nextTime = CarbonImmutable::parse($scheduledAt)->addMinutes(30);
        $hourKey = gmdate('Y-m-d-H', $nextTime->timestamp);
        $key = "reminders:{$hourKey}";

        $data['nag_count'] = $nagCount + 1;
        $data['scheduled_at'] = $nextTime->toIso8601String();

        Redis::zadd($key, $nextTime->timestamp, json_encode($data));

        Log::debug('Reminder: nag re-enqueued', [
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'nag' => $nagCount + 1,
            'next_at' => $nextTime->toIso8601String(),
        ]);
    }
}
