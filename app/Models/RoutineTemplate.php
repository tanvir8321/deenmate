<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $title
 * @property string $description
 * @property string $locale
 * @property string $category
 * @property array<string, mixed> $payload
 * @property bool $verified
 * @property int $install_count
 * @property bool $published
 */
#[Fillable([
    'author_id', 'title', 'description', 'locale', 'category',
    'payload', 'verified', 'install_count', 'published',
])]
class RoutineTemplate extends Model
{
    protected $table = 'routine_templates';

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'verified' => 'boolean',
            'install_count' => 'integer',
            'published' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
