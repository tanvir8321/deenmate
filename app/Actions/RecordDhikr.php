<?php

namespace App\Actions;

use App\Models\User;
use Carbon\CarbonImmutable;

class RecordDhikr
{
    /**
     * @return array{id: int, slug: string, count: int, target: int, completed: bool}
     */
    public function __invoke(User $user, string $slug, int $count, int $target, CarbonImmutable $date): array
    {
        $session = $user->dhikrSessions()->updateOrCreate(
            ['slug' => $slug, 'date' => $date->toDateString()],
            ['count' => $count, 'target' => $target],
        );

        return [
            'id' => $session->id,
            'slug' => $session->slug,
            'count' => $session->count,
            'target' => $session->target,
            'completed' => $session->count >= $session->target,
        ];
    }
}
