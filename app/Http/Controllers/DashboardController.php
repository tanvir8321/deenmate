<?php

namespace App\Http\Controllers;

use App\Services\DashboardStatsService;
use App\Services\GoalProgressService;
use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use App\Services\SalahAnalyticsService;
use App\Services\TodayResolver;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly PrayerTimeService $prayerTimes,
        private readonly HijriCalendarService $hijri,
        private readonly TodayResolver $today,
        private readonly DashboardStatsService $stats,
        private readonly GoalProgressService $goalProgress,
        private readonly SalahAnalyticsService $salahAnalytics,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = CarbonImmutable::now($user->timezone)->startOfDay();

        $prayerTimes = null;
        if ($user->lat !== null && $user->lng !== null) {
            $times = $this->prayerTimes->times($user, $today);
            $prayerTimes = array_map(
                fn ($t) => $t->format('H:i'),
                $times->times(),
            );
        }

        $hijriDate = $this->hijri->toHijriWithOffset($today, $user->hijri_offset);

        $statValues = $this->stats->stats($user, $today);

        $goals = $user->goals()
            ->orderByDesc('starts_on')
            ->get()
            ->map(function ($goal) use ($today) {
                $key = $this->goalProgress->periodKey($goal, $today);
                $progress = $goal->goalProgress()->where('period_key', $key)->first();

                return [
                    'id' => $goal->id,
                    'title' => $goal->title,
                    'period' => $goal->period,
                    'period_basis' => $goal->period_basis,
                    'target_value' => $goal->target_value,
                    'unit' => $goal->unit,
                    'metric_source' => $goal->metric_source,
                    'current_value' => $progress->current_value ?? 0,
                    'progress_pct' => $goal->target_value > 0
                        ? round((($progress->current_value ?? 0) / $goal->target_value) * 100, 1)
                        : 0,
                ];
            });

        // Streak heatmap data: last 90 days of done/missed
        $heatmapDates = $user->taskInstances()
            ->where('status', 'done')
            ->whereDate('due_date', '>=', $today->subDays(89)->toDateString())
            ->whereDate('due_date', '<=', $today->toDateString())
            ->distinct()
            ->pluck('due_date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->all();

        $salahHeatmap = $this->salahAnalytics->heatmap($user, 90, $today);
        $salahBreakdown = $this->salahAnalytics->breakdown(
            $user,
            $today->subDays(89),
            $today,
        );
        $salahStreak = $this->salahAnalytics->currentStreak($user, $today);

        $qadaCounters = $user->qadaCounters()->get()->keyBy('kind');
        $byPrayer = [];
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $row = $qadaCounters->get('salah_'.$p);
            $byPrayer[$p] = [
                'owed' => (int) ($row->owed ?? 0),
                'repaid' => (int) ($row->repaid ?? 0),
            ];
        }
        $fastRow = $qadaCounters->get('fast');
        $qadaSummary = [
            'owed' => (int) $qadaCounters->sum('owed'),
            'repaid' => (int) $qadaCounters->sum('repaid'),
            'outstanding' => max(0, (int) $qadaCounters->sum('owed') - (int) $qadaCounters->sum('repaid')),
            'by_prayer' => $byPrayer,
            'fast' => [
                'owed' => (int) ($fastRow->owed ?? 0),
                'repaid' => (int) ($fastRow->repaid ?? 0),
            ],
        ];

        $nextPrayer = $prayerTimes !== null
            ? $this->prayerTimes->next($user, $today)
            : null;

        return Inertia::render('Dashboard', [
            'prayerTimes' => $prayerTimes,
            'hijriDate' => $hijriDate,
            'hijriEvent' => $this->hijri->event($today, $user->hijri_offset),
            'gregorianDate' => $today->toDateString(),
            'hasLocation' => $prayerTimes !== null,
            'day' => $this->today->for($user, $today),
            'stats' => $statValues,
            'goals' => $goals->values(),
            'heatmapDates' => array_values($heatmapDates),
            'salahHeatmap' => $salahHeatmap,
            'salahBreakdown' => $salahBreakdown,
            'salahStreak' => $salahStreak,
            'qadaSummary' => $qadaSummary,
            'nextPrayer' => $nextPrayer !== null
                ? [
                    'name' => $nextPrayer['name'],
                    'at' => $nextPrayer['at']->toIso8601String(),
                ]
                : null,
        ]);
    }
}
