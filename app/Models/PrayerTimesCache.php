<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property array<string, string> $times
 */
class PrayerTimesCache extends Model
{
    protected $table = 'prayer_times_cache';

    public $timestamps = false;

    protected $fillable = [
        'date', 'geohash', 'method', 'asr_method', 'high_lat_rule', 'times',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'times' => 'array',
        ];
    }
}
