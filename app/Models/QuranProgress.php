<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property Carbon $date
 * @property int $pages_read
 */
#[Fillable(['user_id', 'date', 'pages_read', 'from_ref', 'to_ref'])]
class QuranProgress extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'pages_read' => 'int',
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
