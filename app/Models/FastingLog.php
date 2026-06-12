<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property Carbon $date
 * @property string $type
 * @property string $status
 */
#[Fillable(['user_id', 'date', 'type', 'status'])]
class FastingLog extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => 'string',
            'status' => 'string',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
