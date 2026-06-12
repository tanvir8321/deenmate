<?php

namespace App\Services\Reminders;

use Illuminate\Support\Facades\Redis;

class RedisReminderStore implements ReminderStore
{
    private const KEY = 'reminders:pending';

    public function add(array $payload, int $timestamp): void
    {
        Redis::zadd(self::KEY, [json_encode($payload) => $timestamp]);
    }

    public function claimDue(int $until): array
    {
        $members = Redis::zrangebyscore(self::KEY, '-inf', (string) $until);

        if ($members === []) {
            return [];
        }

        Redis::zrem(self::KEY, ...$members);

        return array_values(array_filter(array_map(
            fn (string $member) => json_decode($member, true),
            $members,
        )));
    }

    public function clear(): void
    {
        Redis::del(self::KEY);
    }
}
