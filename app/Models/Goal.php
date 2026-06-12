<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $user_id
 * @property string $title
 * @property string $period
 * @property string $period_basis
 * @property int $target_value
 * @property string $unit
 * @property string $metric_source
 * @property array<int>|null $linked_routine_ids
 * @property CarbonImmutable $starts_on
 * @property CarbonImmutable|null $ends_on
 */
#[Fillable([
    'user_id', 'title', 'period', 'period_basis', 'target_value',
    'unit', 'metric_source', 'linked_routine_ids', 'starts_on', 'ends_on',
])]
class Goal extends Model
{
    protected function casts(): array
    {
        return [
            'linked_routine_ids' => 'array',
            'period' => 'string',
            'period_basis' => 'string',
            'unit' => 'string',
            'metric_source' => 'string',
            'target_value' => 'integer',
            'starts_on' => 'date',
            'ends_on' => 'date',
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
     * @return HasMany<GoalProgress, $this>
     */
    public function goalProgress(): HasMany
    {
        return $this->hasMany(GoalProgress::class);
    }
}
