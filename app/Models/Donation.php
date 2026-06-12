<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int|null $user_id
 * @property string $provider
 * @property float $amount
 * @property string $currency
 * @property string|null $external_id
 * @property CarbonImmutable|null $donated_at
 */
#[Fillable(['user_id', 'provider', 'amount', 'currency', 'external_id', 'donated_at'])]
class Donation extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'donated_at' => 'datetime',
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
