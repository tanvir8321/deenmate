<?php

namespace App\Actions;

use App\Models\User;
use Carbon\CarbonImmutable;

class LogFasting
{
    /**
     * @return array{id: int, date: string, type: string, status: string, monthly_total: int}
     */
    public function __invoke(User $user, CarbonImmutable $date, string $type, string $status): array
    {
        $log = $user->fastingLogs()->updateOrCreate(
            ['date' => $date->toDateString()],
            ['type' => $type, 'status' => $status],
        );

        if ($type === 'qada' && $status === 'completed') {
            $counter = $user->qadaCounters()->where('kind', 'fast')->first();
            if ($counter && $counter->owed > $counter->repaid) {
                $counter->increment('repaid');
            }
        }

        $monthlyTotal = $user->fastingLogs()
            ->whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->where('status', 'completed')
            ->count();

        return [
            'id' => $log->id,
            'date' => $date->toDateString(),
            'type' => $log->type,
            'status' => $log->status,
            'monthly_total' => (int) $monthlyTotal,
        ];
    }
}
