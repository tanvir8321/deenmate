<?php

namespace App\Actions;

use App\Models\User;
use Carbon\CarbonImmutable;

class LogQuranReading
{
    /**
     * @return array{id: int, date: string, pages_read: int, from_ref: string|null, to_ref: string|null, monthly_total: int}
     */
    public function __invoke(User $user, CarbonImmutable $date, int $pagesRead, ?string $fromRef, ?string $toRef): array
    {
        $progress = $user->quranProgress()->updateOrCreate(
            ['date' => $date->toDateString()],
            [
                'pages_read' => $pagesRead,
                'from_ref' => $fromRef,
                'to_ref' => $toRef,
            ],
        );

        $monthlyTotal = $user->quranProgress()
            ->whereYear('date', $date->year)
            ->whereMonth('date', $date->month)
            ->sum('pages_read');

        return [
            'id' => $progress->id,
            'date' => $date->toDateString(),
            'pages_read' => $progress->pages_read,
            'from_ref' => $progress->from_ref,
            'to_ref' => $progress->to_ref,
            'monthly_total' => (int) $monthlyTotal,
        ];
    }
}
