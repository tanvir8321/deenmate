<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class ThankYouNotification extends Notification
{
    public function __construct(
        public string $name,
        public float $amount,
        public string $currency = 'USD',
    ) {}

    /**
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'donation_thank_you',
            'title' => __('Thank you for your support!'),
            'body' => __('Thank you for your :currency :amount donation. May Allah accept it as Sadaqah Jariyah.', [
                'currency' => $this->currency,
                'amount' => number_format($this->amount, 2),
            ]),
            'amount' => $this->amount,
            'currency' => $this->currency,
        ];
    }
}
