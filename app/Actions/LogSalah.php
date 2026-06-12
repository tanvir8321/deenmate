<?php

namespace App\Actions;

use App\Models\SalahLog;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

class LogSalah
{
    public function __invoke(
        User $user,
        CarbonImmutable $date,
        string $prayer,
        string $status,
    ): SalahLog {
        $log = SalahLog::query()
            ->where('user_id', $user->id)
            ->whereDate('date', $date->toDateString())
            ->where('prayer', $prayer)
            ->first() ?? new SalahLog([
                'user_id' => $user->id,
                'date' => $date->toDateString(),
                'prayer' => $prayer,
            ]);

        $log->status = $status;
        $log->save();

        if (in_array($status, ['jamaat', 'alone'])) {
            $this->bustSalahStreakCache($user->id, $date->toDateString());
        }

        return $log;
    }

    private function bustSalahStreakCache(int $userId, string $date): void
    {
        Cache::forget("salah_streak:{$userId}:{$date}");
    }
}
