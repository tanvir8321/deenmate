<?php

namespace App\Jobs;

use App\Models\TaskInstance;
use App\Models\User;
use App\Notifications\TaskReminderNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification as NotificationFacade;

/**
 * High-priority job. Deduped by (user_id, routine_id, date).
 * Max 4 nag re-enqueues at +30 min intervals.
 */
class SendTaskReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;

    public int $backoff = 300;

    public function __construct(
        public int $userId,
        public ?int $routineId,
        public ?int $taskInstanceId,
        public string $title,
        public string $dedupeKey,
        public int $nagCount = 0,
    ) {
        $this->onQueue('high');
    }

    public function handle(): void
    {
        // Dedup: if a materialized row (done/skipped/missed) exists, skip.
        if ($this->routineId && $this->taskInstanceId === null) {
            $exists = TaskInstance::query()
                ->where('user_id', $this->userId)
                ->where('routine_id', $this->routineId)
                ->whereIn('status', ['done', 'skipped', 'missed'])
                ->exists();

            if ($exists) {
                Log::debug('SendTaskReminder: skipping, already materialized', [
                    'dedupe_key' => $this->dedupeKey,
                ]);

                return;
            }
        }

        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        NotificationFacade::send($user, new TaskReminderNotification(
            title: $this->title,
            nagCount: $this->nagCount,
        ));

        Log::debug('SendTaskReminder: dispatched', [
            'user_id' => $this->userId,
            'title' => $this->title,
            'nag' => $this->nagCount,
        ]);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendTaskReminder failed permanently', [
            'user_id' => $this->userId,
            'title' => $this->title,
            'error' => $e->getMessage(),
        ]);
    }
}
