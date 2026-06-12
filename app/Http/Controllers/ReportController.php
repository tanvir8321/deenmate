<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DashboardStatsService;
use App\Services\HijriCalendarService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly DashboardStatsService $stats,
        private readonly HijriCalendarService $hijri,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $period = $request->query('period', 'weekly');
        $isHijri = $request->boolean('is_hijri', false);

        $now = CarbonImmutable::now($user->timezone);

        return match ($period) {
            'weekly' => $this->weeklyResponse($user, $request, $now),
            'monthly' => $this->monthlyResponse($user, $request, $now, $isHijri),
            'yearly' => $this->yearlyResponse($user, $request, $now, $isHijri),
            default => response()->json(['error' => 'Invalid period'], 422),
        };
    }

    private function weeklyResponse(User $user, Request $request, CarbonImmutable $now): JsonResponse
    {
        $weekStart = $request->query('week_start')
            ? CarbonImmutable::parse($request->query('week_start'), $user->timezone)->startOfDay()
            : $now->startOfWeek(CarbonImmutable::MONDAY);

        $stats = $this->stats->weeklyStats($user, $weekStart);

        return response()->json([
            'period' => 'weekly',
            'week_start' => $weekStart->toDateString(),
            'week_end' => $weekStart->addDays(6)->toDateString(),
            ...$stats,
        ]);
    }

    private function monthlyResponse(User $user, Request $request, CarbonImmutable $now, bool $isHijri): JsonResponse
    {
        if ($request->query('month_start')) {
            $monthStart = CarbonImmutable::parse($request->query('month_start'), $user->timezone)->startOfDay();
        } elseif ($isHijri) {
            $hijri = $this->hijri->toHijriWithOffset($now, $user->hijri_offset);
            $monthStart = $this->hijri->toGregorian($hijri['year'], $hijri['month'], 1);
        } else {
            $monthStart = $now->startOfMonth();
        }

        $stats = $this->stats->monthlyStats($user, $monthStart, $isHijri);

        return response()->json([
            'period' => 'monthly',
            'is_hijri' => $isHijri,
            'month_start' => $monthStart->toDateString(),
            ...$stats,
        ]);
    }

    private function yearlyResponse(User $user, Request $request, CarbonImmutable $now, bool $isHijri): JsonResponse
    {
        if ($request->query('year')) {
            $year = (int) $request->query('year');
        } elseif ($isHijri) {
            $year = $this->hijri->toHijriWithOffset($now, $user->hijri_offset)['year'];
        } else {
            $year = $now->year;
        }

        $stats = $this->stats->yearlyStats($user, $year, $isHijri);

        return response()->json([
            'period' => 'yearly',
            'year' => $year,
            'is_hijri' => $isHijri,
            ...$stats,
        ]);
    }
}
