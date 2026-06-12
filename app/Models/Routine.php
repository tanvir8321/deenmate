<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\RoutineFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property array<string, mixed> $recurrence
 * @property CarbonImmutable $starts_on
 * @property CarbonImmutable|null $ends_on
 */
#[Fillable([
    'user_id', 'title', 'category', 'recurrence', 'anchor', 'offset_minutes',
    'fixed_time', 'reminder_enabled', 'nag_mode', 'starts_on', 'ends_on',
    'is_active', 'source_template_id',
])]
class Routine extends Model
{
    /** @use HasFactory<RoutineFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'recurrence' => 'array',
            'offset_minutes' => 'integer',
            'reminder_enabled' => 'boolean',
            'nag_mode' => 'boolean',
            'starts_on' => 'immutable_date',
            'ends_on' => 'immutable_date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<TaskInstance, $this>
     */
    public function taskInstances(): HasMany
    {
        return $this->hasMany(TaskInstance::class);
    }
}
