<?php

namespace App\Actions;

use App\Models\Circle;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class JoinCircle
{
    public function __invoke(User $user, string $inviteCode): Circle
    {
        $circle = Circle::query()->where('invite_code', $inviteCode)->firstOrFail();

        if ($circle->members()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'invite_code' => __('You are already a member of this circle.'),
            ]);
        }

        $circle->members()->attach($user->id, ['share_level' => 'streak_only']);

        return $circle;
    }
}
