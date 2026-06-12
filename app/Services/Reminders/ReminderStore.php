<?php

namespace App\Services\Reminders;

/**
 * Time-ordered queue of pending reminder dispatches.
 * Production: Redis sorted set. Tests bind the array implementation.
 */
interface ReminderStore
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function add(array $payload, int $timestamp): void;

    /**
     * Atomically claim every entry due at or before $until.
     *
     * @return list<array<string, mixed>>
     */
    public function claimDue(int $until): array;

    public function clear(): void;
}
