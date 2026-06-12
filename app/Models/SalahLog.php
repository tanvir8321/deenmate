<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property Carbon $date
 * @property string $prayer
 * @property string $status
 * @property int|null $c
 */
#[Fillable(['user_id', 'date', 'prayer', 'status'])]
class SalahLog extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'prayer' => 'string',
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
