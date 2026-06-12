<?php

namespace App\Notifications;

use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use Carbon\CarbonImmutable;
use Illuminate\Notifications\Notification;

class MorningBriefingNotification extends Notification
{
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
            'type' => 'morning_briefing',
            'title' => __('app.morning_briefing'),
            'body' => $this->buildBody($notifiable),
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
            'title' => __('app.morning_briefing'),
            'body' => $this->buildBody($notifiable),
            'icon' => '/icons/icon-192.png',
            'badge' => '/icons/badge-72.png',
            'tag' => "briefing:{$notifiable->id}",
        ];
    }

    private function buildBody(object $notifiable): string
    {
        $hijri = app(HijriCalendarService::class);
        $prayerTimes = app(PrayerTimeService::class);

        $today = CarbonImmutable::now($notifiable->timezone)->startOfDay();
        $hijriDate = $hijri->hijriDate($today, $notifiable->hijri_offset ?? 0);
        $times = $prayerTimes->times($notifiable, $today);

        $fajrTime = $times->fajr->format('g:i A');
        $sunriseTime = $times->sunrise->format('g:i A');

        $hijriStr = $hijriDate->format('%d %B %Y').' ('.$hijriDate->format('%d %B').')';

        return "{$hijriStr}\n"
            ."Fajr: {$fajrTime} | Sunrise: {$sunriseTime}\n"
            .__('app.tap_to_view_today');
    }
}
