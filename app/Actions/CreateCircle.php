<?php

namespace App\Actions;

use App\Models\Circle;
use App\Models\User;
use Illuminate\Support\Str;

class CreateCircle
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(User $user, array $data): Circle
    {
        $inviteCode = Str::random(8);
        while (Circle::query()->where('invite_code', $inviteCode)->exists()) {
            $inviteCode = Str::random(8);
        }

        $circle = Circle::query()->create([
            'name' => $data['name'],
            'owner_id' => $user->id,
            'invite_code' => $inviteCode,
        ]);

        $circle->members()->attach($user->id, ['share_level' => 'full']);

        return $circle;
    }
}
