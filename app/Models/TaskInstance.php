<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\TaskInstanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property CarbonImmutable $due_date
 * @property CarbonImmutable|null $due_at
 * @property CarbonImmutable|null $completed_at
 */
#[Fillable([
    'user_id', 'routine_id', 'title', 'due_date', 'due_at',
    'status', 'completed_at', 'note',
])]
class TaskInstance extends Model
{
    /** @use HasFactory<TaskInstanceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'due_date' => 'immutable_date',
            'due_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
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
     * @return BelongsTo<Routine, $this>
     */
    public function routine(): BelongsTo
    {
        return $this->belongsTo(Routine::class);
    }
}
