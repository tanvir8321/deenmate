<?php

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $status
 * @property int $ease
 * @property int $interval_days
 * @property CarbonImmutable|Carbon|null $next_review_on
 */
#[Fillable(['user_id', 'ref_start', 'ref_end', 'status', 'ease', 'next_review_on', 'interval_days'])]
class HifzItem extends Model
{
    protected $attributes = [
        'ease' => 250,
        'interval_days' => 1,
    ];

    protected function casts(): array
    {
        return [
            'status' => 'string',
            'ease' => 'int',
            'interval_days' => 'int',
            'next_review_on' => 'immutable_date',
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
