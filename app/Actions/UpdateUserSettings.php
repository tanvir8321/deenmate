<?php

namespace App\Actions;

use App\Models\User;
use App\Support\Geohash;

class UpdateUserSettings
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(User $user, array $data): User
    {
        if (isset($data['lat'], $data['lng'])) {
            $data['geohash'] = Geohash::encode((float) $data['lat'], (float) $data['lng'], 6);
        }

        $user->fill($data);

        if ($user->onboarded_at === null) {
            $user->onboarded_at = now();
        }

        $user->save();

        return $user->refresh();
    }
}
