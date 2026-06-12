<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class TaskReminderNotification extends Notification
{
    public function __construct(
        public string $title,
        public int $nagCount = 0,
    ) {}

    /**
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        /** @var array<string> */
        $channels = ['broadcast', 'database'];

        if ($notifiable->pushSubscriptions()->count() > 0) {
            $channels[] = 'webpush';
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_reminder',
            'title' => __('app.reminder'),
            'body' => $this->title,
            'nag' => $this->nagCount,
            'icon' => '/icons/icon-192.png',
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function toWebPush(object $notifiable, array $data): array
    {
        return [
            'title' => __('app.reminder'),
            'body' => $this->title,
            'icon' => '/icons/icon-192.png',
            'badge' => '/icons/badge-72.png',
            'tag' => "reminder:{$notifiable->id}",
            'renotify' => $this->nagCount > 0,
            'data' => [
                'type' => 'task_reminder',
                'nag' => $this->nagCount,
            ],
        ];
    }
}
