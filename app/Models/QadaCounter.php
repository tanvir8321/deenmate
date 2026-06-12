<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $owed
 * @property int $repaid
 */
#[Fillable(['user_id', 'kind', 'owed', 'repaid'])]
class QadaCounter extends Model
{
    protected function casts(): array
    {
        return [
            'owed' => 'int',
            'repaid' => 'int',
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
