<?php

namespace App\Services\Reminders;

/**
 * In-memory store for tests and redis-less local development.
 */
class ArrayReminderStore implements ReminderStore
{
    /** @var list<array{payload: array<string, mixed>, ts: int}> */
    public array $entries = [];

    public function add(array $payload, int $timestamp): void
    {
        $this->entries[] = ['payload' => $payload, 'ts' => $timestamp];
    }

    public function claimDue(int $until): array
    {
        $due = [];
        $rest = [];
        foreach ($this->entries as $entry) {
            if ($entry['ts'] <= $until) {
                $due[] = $entry['payload'];
            } else {
                $rest[] = $entry;
            }
        }
        $this->entries = $rest;

        return $due;
    }

    public function clear(): void
    {
        $this->entries = [];
    }
}
