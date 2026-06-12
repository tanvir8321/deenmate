<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name', 'email', 'password',
    'timezone', 'locale', 'geohash', 'lat', 'lng',
    'calc_method', 'asr_method', 'high_lat_rule', 'hijri_offset',
    'quiet_start', 'quiet_end', 'onboarded_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $attributes = [
        'timezone' => 'UTC',
        'locale' => 'en',
        'calc_method' => 'karachi',
        'asr_method' => 'hanafi',
        'high_lat_rule' => 'none',
        'hijri_offset' => 0,
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'lat' => 'float',
            'lng' => 'float',
            'hijri_offset' => 'integer',
            'onboarded_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<PrayerTimesCache, $this>
     */
    public function prayerTimesCache(): HasMany
    {
        return $this->hasMany(PrayerTimesCache::class, 'geohash', 'geohash');
    }

    /**
     * @return HasMany<Routine, $this>
     */
    public function routines(): HasMany
    {
        return $this->hasMany(Routine::class);
    }

    /**
     * @return HasMany<TaskInstance, $this>
     */
    public function taskInstances(): HasMany
    {
        return $this->hasMany(TaskInstance::class);
    }

    /**
     * @return HasMany<Todo, $this>
     */
    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    /**
     * @return HasMany<TodoList, $this>
     */
    public function todoLists(): HasMany
    {
        return $this->hasMany(TodoList::class);
    }
}
