<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $subscribable_id
 * @property string $subscribable_type
 * @property string $endpoint
 * @property string|null $public_key
 * @property string|null $auth_token
 * @property string|null $content_encoding
 */
class PushSubscription extends Model
{
    protected $fillable = [
        'endpoint',
        'public_key',
        'auth_token',
        'content_encoding',
    ];

    /**
     * @return MorphTo<Model, $this>
     */
    public function subscribable(): MorphTo
    {
        return $this->morphTo();
    }
}
