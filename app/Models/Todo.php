<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\TodoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property CarbonImmutable|null $due_date
 * @property CarbonImmutable|null $due_at
 * @property CarbonImmutable|null $completed_at
 */
#[Fillable([
    'user_id', 'todo_list_id', 'parent_id', 'title', 'description',
    'priority', 'due_date', 'due_at', 'status', 'completed_at', 'sort_order',
])]
class Todo extends Model
{
    /** @use HasFactory<TodoFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'due_date' => 'immutable_date',
            'due_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<TodoList, $this>
     */
    public function list(): BelongsTo
    {
        return $this->belongsTo(TodoList::class, 'todo_list_id');
    }

    /**
     * @return BelongsTo<Todo, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<Todo, $this>
     */
    public function subtasks(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }
}
