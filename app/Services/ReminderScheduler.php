<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Redis;

/**
 * Precomputes reminder timestamps for a given UTC date.
 * Writes to Redis sorted set reminders:{yyyy-mm-dd-hh} with score = unix ts.
 * Dispatcher reads minute-by-minute.
 */
class ReminderScheduler
{
    private const PREFIX = 'reminders';

    public function scheduleForDate(User $user, CarbonImmutable $localDate): void
    {
        try {
            $this->doSchedule($user, $localDate);
        } catch (\Throwable $e) {
            if (app()->environment('local', 'testing')) {
                return;
            }
            throw $e;
        }
    }

    private function doSchedule(User $user, CarbonImmutable $localDate): void
    {
        $today = $user->timezone;
        $local = $localDate->setTimezone($today);
        $dateStr = $local->toDateString();

        $this->bust($user->id, $dateStr);

        $resolver = app(TodayResolver::class);
        $items = $resolver->for($user, $local);

        foreach ($items['routines'] as $item) {
            if (empty($item['reminder_enabled'])) {
                continue;
            }

            $timeStr = $item['time'] ?? null;
            if (! $timeStr) {
                continue;
            }

            $dueUtc = $local->setTimeFromTimeString($timeStr)->setTimezone('UTC');
            $hourKey = $dueUtc->format('Y-m-d-H');

            if ($this->inQuietHours($user, $dueUtc)) {
                continue;
            }

            $dedupeKey = "{$user->id}:{$item['routine_id']}:{$dateStr}";
            $score = $dueUtc->timestamp;

            Redis::zadd(self::PREFIX.":{$hourKey}", $score, json_encode([
                'user_id' => $user->id,
                'routine_id' => $item['routine_id'] ?? null,
                'task_instance_id' => $item['instance_id'] ?? null,
                'title' => $item['title'],
                'dedupe_key' => $dedupeKey,
                'scheduled_at' => $dueUtc->toIso8601String(),
                'nag_count' => 0,
            ]));
        }
    }

    public function bust(int $userId, string $date): void
    {
        try {
            $this->doBust($userId, $date);
        } catch (\Throwable) {
            // Redis unavailable — nothing to bust.
        }
    }

    private function doBust(int $userId, string $date): void
    {
        // Bust all hour buckets for this user/date combo.
        // We don't know which hours had entries, so iterate 0-23.
        for ($h = 0; $h < 24; $h++) {
            $hourKey = gmdate('Y-m-d-H', strtotime($date) + $h * 3600);
            $key = self::PREFIX.":{$hourKey}";

            // Remove all entries for this user from this hour's set.
            $members = Redis::zrange($key, 0, -1);
            foreach ($members as $member) {
                $data = json_decode($member, true);
                if (($data['user_id'] ?? null) === $userId) {
                    Redis::zrem($key, $member);
                }
            }
        }
    }

    private function inQuietHours(User $user, CarbonImmutable $utcTime): bool
    {
        if (! $user->quiet_start || ! $user->quiet_end) {
            return false;
        }

        $local = $utcTime->setTimezone($user->timezone);
        $currentMinutes = $local->hour * 60 + $local->minute;

        [$startH, $startM] = explode(':', $user->quiet_start);
        [$endH, $endM] = explode(':', $user->quiet_end);

        $startMinutes = (int) $startH * 60 + (int) $startM;
        $endMinutes = (int) $endH * 60 + (int) $endM;

        if ($startMinutes <= $endMinutes) {
            return $currentMinutes >= $startMinutes && $currentMinutes < $endMinutes;
        }

        // Quiet hours span midnight.
        return $currentMinutes >= $startMinutes || $currentMinutes < $endMinutes;
    }
}
