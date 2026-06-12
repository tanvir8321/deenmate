<?php

namespace Database\Seeders;

use App\Models\RoutineTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DefaultRoutinePackSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $packs = [
            [
                'title' => 'Daily Essentials',
                'description' => 'Morning and evening adhkar plus a daily page of Quran.',
                'locale' => 'en',
                'category' => 'adhkar',
                'published' => true,
                'verified' => true,
                'payload' => [
                    'routines' => [
                        [
                            'title' => 'Morning Adhkar',
                            'category' => 'adhkar',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'fajr',
                            'offset_minutes' => 15,
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Evening Adhkar',
                            'category' => 'adhkar',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'asr',
                            'offset_minutes' => 15,
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Daily page of Quran',
                            'category' => 'quran',
                            'recurrence' => ['freq' => 'daily'],
                            'reminder_enabled' => false,
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Ramadan Pack',
                'description' => 'Tarawih prayer, suhoor adhkar, and daily khatm goal.',
                'locale' => 'en',
                'category' => 'fasting',
                'published' => true,
                'verified' => true,
                'payload' => [
                    'routines' => [
                        [
                            'title' => 'Tarawih Prayer',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]],
                            'anchor' => 'isha',
                            'offset_minutes' => 15,
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Suhoor Adhkar',
                            'category' => 'adhkar',
                            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]],
                            'fixed_time' => '03:30',
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Daily khatm goal',
                            'category' => 'quran',
                            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]],
                            'reminder_enabled' => false,
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Sunnah Fasting',
                'description' => 'Monday/Thursday and Ayyam al-Beedh (13th-15th of each Hijri month) fasting routines.',
                'locale' => 'en',
                'category' => 'fasting',
                'published' => true,
                'verified' => true,
                'payload' => [
                    'routines' => [
                        [
                            'title' => 'Monday Fasting',
                            'category' => 'fasting',
                            'recurrence' => ['freq' => 'weekly', 'days' => ['mon']],
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Thursday Fasting',
                            'category' => 'fasting',
                            'recurrence' => ['freq' => 'weekly', 'days' => ['thu']],
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Ayyam al-Beedh Fasting',
                            'category' => 'fasting',
                            'recurrence' => ['freq' => 'hijri_monthly', 'hijri_days' => [13, 14, 15]],
                            'reminder_enabled' => true,
                        ],
                    ],
                ],
            ],
            [
                'title' => 'New Muslim Starter',
                'description' => 'Five daily salah and basic morning/evening adhkar.',
                'locale' => 'en',
                'category' => 'salah',
                'published' => true,
                'verified' => true,
                'payload' => [
                    'routines' => [
                        [
                            'title' => 'Fajr Salah',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'fajr',
                            'offset_minutes' => 0,
                            'reminder_enabled' => true,
                            'nag_mode' => true,
                        ],
                        [
                            'title' => 'Dhuhr Salah',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'dhuhr',
                            'offset_minutes' => 0,
                            'reminder_enabled' => true,
                            'nag_mode' => true,
                        ],
                        [
                            'title' => 'Asr Salah',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'asr',
                            'offset_minutes' => 0,
                            'reminder_enabled' => true,
                            'nag_mode' => true,
                        ],
                        [
                            'title' => 'Maghrib Salah',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'maghrib',
                            'offset_minutes' => 0,
                            'reminder_enabled' => true,
                            'nag_mode' => true,
                        ],
                        [
                            'title' => 'Isha Salah',
                            'category' => 'salah',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'isha',
                            'offset_minutes' => 0,
                            'reminder_enabled' => true,
                            'nag_mode' => true,
                        ],
                        [
                            'title' => 'Morning Adhkar',
                            'category' => 'adhkar',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'fajr',
                            'offset_minutes' => 15,
                            'reminder_enabled' => true,
                        ],
                        [
                            'title' => 'Evening Adhkar',
                            'category' => 'adhkar',
                            'recurrence' => ['freq' => 'daily'],
                            'anchor' => 'asr',
                            'offset_minutes' => 15,
                            'reminder_enabled' => true,
                        ],
                    ],
                ],
            ],
        ];

        foreach ($packs as $pack) {
            RoutineTemplate::firstOrCreate(
                ['title' => $pack['title']],
                $pack,
            );
        }
    }
}
