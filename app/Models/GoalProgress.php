<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $goal_id
 * @property string $period_key
 * @property int $current_value
 */
#[Fillable(['goal_id', 'period_key', 'current_value'])]
class GoalProgress extends Model
{
    protected $table = 'goal_progress';

    protected function casts(): array
    {
        return [
            'current_value' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Goal, $this>
     */
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
