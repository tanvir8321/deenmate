<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name', 'display_name', 'email', 'password',
    'timezone', 'locale', 'theme', 'geohash', 'lat', 'lng',
    'calc_method', 'asr_method', 'high_lat_rule', 'hijri_offset',
    'quiet_start', 'quiet_end', 'onboarded_at', 'notification_preferences',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $attributes = [
        'timezone' => 'UTC',
        'locale' => 'en',
        'theme' => 'deenmate',
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
            'notification_preferences' => 'array',
        ];
    }

    /**
     * @return array<string, bool>
     */
    public static function defaultNotificationPreferences(): array
    {
        return [
            'salah_reminder' => true,
            'morning_briefing' => true,
            'evening_briefing' => false,
            'adhkar_reminder' => true,
            'fasting_reminder' => true,
            'weekly_report' => false,
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

    /**
     * @return HasMany<PushSubscription, $this>
     */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * @return HasMany<HifzItem, $this>
     */
    public function hifzItems(): HasMany
    {
        return $this->hasMany(HifzItem::class);
    }

    /**
     * @return HasMany<SalahLog, $this>
     */
    public function salahLogs(): HasMany
    {
        return $this->hasMany(SalahLog::class);
    }

    /**
     * @return HasMany<DhikrSession, $this>
     */
    public function dhikrSessions(): HasMany
    {
        return $this->hasMany(DhikrSession::class);
    }

    /**
     * @return HasMany<FastingLog, $this>
     */
    public function fastingLogs(): HasMany
    {
        return $this->hasMany(FastingLog::class);
    }

    /**
     * @return HasMany<QadaCounter, $this>
     */
    public function qadaCounters(): HasMany
    {
        return $this->hasMany(QadaCounter::class);
    }

    /**
     * @return HasMany<QuranProgress, $this>
     */
    public function quranProgress(): HasMany
    {
        return $this->hasMany(QuranProgress::class);
    }

    /**
     * @return HasMany<Goal, $this>
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * @return BelongsToMany<Circle, $this>
     */
    public function circles(): BelongsToMany
    {
        return $this->belongsToMany(Circle::class, 'circle_members')
            ->withPivot('share_level')
            ->withTimestamps();
    }

    /**
     * @return HasMany<CircleMember, $this>
     */
    public function circleMembers(): HasMany
    {
        return $this->hasMany(CircleMember::class);
    }
}
