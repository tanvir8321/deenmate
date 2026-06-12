<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property Carbon $date
 * @property int $count
 * @property int $target
 */
#[Fillable(['user_id', 'slug', 'count', 'target', 'date'])]
class DhikrSession extends Model
{
    protected function casts(): array
    {
        return [
            'count' => 'int',
            'target' => 'int',
            'date' => 'date',
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
