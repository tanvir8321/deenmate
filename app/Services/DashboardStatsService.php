<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;

class DashboardStatsService
{
    public function __construct(
        private readonly StreakService $streak,
        private readonly HijriCalendarService $hijri,
    ) {}

    /**
     * @return array{completion_pct: float, salah_jamaat_count: int, quran_pages: int, current_streak: int, longest_streak: int}
     */
    public function stats(User $user, CarbonImmutable $localDate): array
    {
        $key = "dashboard_stats:{$user->id}:{$localDate->toDateString()}";

        return Cache::remember(
            $key,
            $localDate->endOfDay(),
            fn () => $this->computeDaily($user, $localDate),
        );
    }

    /**
     * @return array{days: array<int, array{date: string, completion_pct: float, done: int, total: int, quran_pages: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, current_streak: int, longest_streak: int}
     */
    public function weeklyStats(User $user, CarbonImmutable $weekStart): array
    {
        $key = "weekly_stats:{$user->id}:{$weekStart->toDateString()}";

        return Cache::remember(
            $key,
            $weekStart->addDays(7)->endOfDay(),
            fn () => $this->computeWeekly($user, $weekStart),
        );
    }

    /**
     * @return array{days: array<int, array{date: string, completion_pct: float, done: int, total: int, quran_pages: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, current_streak: int, longest_streak: int, gregorian_month: string, hijri_month: string}
     */
    public function monthlyStats(User $user, CarbonImmutable $monthStart, bool $isHijri): array
    {
        $hijriDate = $this->hijri->toHijriWithOffset($monthStart, $user->hijri_offset);
        $hijriSuffix = $isHijri ? ":H{$hijriDate['year']}-{$hijriDate['month']}" : '';
        $key = "monthly_stats:{$user->id}:{$monthStart->toDateString()}{$hijriSuffix}";

        return Cache::remember(
            $key,
            $monthStart->addDay()->endOfDay(),
            fn () => $this->computeMonthly($user, $monthStart, $isHijri),
        );
    }

    /**
     * @return array{months: array<int, array{month: string, done: int, total: int, quran_pages: int, fasting_completed: int, todos_completed: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, streak_heatmap: array<int, array{date: string, value: int}>, current_streak: int, longest_streak: int, goals: array<int, array{title: string, target: int, current: int, unit: string}>}
     */
    public function yearlyStats(User $user, int $year, bool $isHijri): array
    {
        $key = "yearly_stats:{$user->id}:{$year}:".($isHijri ? 'h' : 'g');

        return Cache::remember(
            $key,
            CarbonImmutable::now('UTC')->endOfDay(),
            fn () => $this->computeYearly($user, $year, $isHijri),
        );
    }

    public static function bust(int $userId, string $date): void
    {
        Cache::forget("dashboard_stats:{$userId}:{$date}");
        Cache::forget("weekly_stats:{$userId}:{$date}");
    }

    /**
     * @return array{completion_pct: float, salah_jamaat_count: int, quran_pages: int, current_streak: int, longest_streak: int}
     */
    private function computeDaily(User $user, CarbonImmutable $localDate): array
    {
        $totalTasks = $user->taskInstances()
            ->whereDate('due_date', $localDate->toDateString())
            ->whereIn('status', ['done', 'skipped', 'missed'])
            ->count();

        $doneTasks = $user->taskInstances()
            ->whereDate('due_date', $localDate->toDateString())
            ->where('status', 'done')
            ->count();

        $completionPct = $totalTasks > 0
            ? round(($doneTasks / $totalTasks) * 100, 1)
            : 0.0;

        $salahJamaatCount = $user->salahLogs()
            ->whereDate('date', $localDate->toDateString())
            ->where('status', 'jamaat')
            ->count();

        $quranPages = (int) $user->quranProgress()
            ->whereDate('date', $localDate->toDateString())
            ->sum('pages_read');

        $streak = $this->streak->global($user, $localDate);

        return [
            'completion_pct' => $completionPct,
            'salah_jamaat_count' => $salahJamaatCount,
            'quran_pages' => $quranPages,
            'current_streak' => $streak['current'],
            'longest_streak' => $streak['longest'],
        ];
    }

    /**
     * @return array{days: array<int, array{date: string, completion_pct: float, done: int, total: int, quran_pages: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, current_streak: int, longest_streak: int}
     */
    private function computeWeekly(User $user, CarbonImmutable $weekStart): array
    {
        $days = [];
        $totalSalah = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0];
        $totalQuran = 0;
        $totalFasting = 0;
        $totalTodos = 0;

        for ($i = 0; $i < 7; $i++) {
            $date = $weekStart->addDays($i);

            $tasksTotal = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->whereIn('status', ['done', 'skipped', 'missed'])
                ->count();
            $tasksDone = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->where('status', 'done')
                ->count();
            $pages = (int) $user->quranProgress()
                ->whereDate('date', $date->toDateString())
                ->sum('pages_read');

            $days[] = [
                'date' => $date->toDateString(),
                'completion_pct' => $tasksTotal > 0 ? round(($tasksDone / $tasksTotal) * 100, 1) : 0.0,
                'done' => $tasksDone,
                'total' => $tasksTotal,
                'quran_pages' => $pages,
            ];

            $totalQuran += $pages;
        }

        $salahLogs = $user->salahLogs()
            ->whereDate('date', '>=', $weekStart->toDateString())
            ->whereDate('date', '<=', $weekStart->addDays(6)->toDateString())
            ->get();

        foreach ($salahLogs as $log) {
            $status = $log->status;
            if (isset($totalSalah[$status])) {
                $totalSalah[$status]++;
            }
        }

        $totalFasting = $user->fastingLogs()
            ->whereDate('date', '>=', $weekStart->toDateString())
            ->whereDate('date', '<=', $weekStart->addDays(6)->toDateString())
            ->where('status', 'completed')
            ->count();

        $totalTodos = $user->todos()
            ->where('status', 'done')
            ->whereDate('completed_at', '>=', $weekStart->toDateString())
            ->whereDate('completed_at', '<=', $weekStart->addDays(6)->toDateString())
            ->count();

        $streak = $this->streak->global($user, $weekStart->addDays(6));

        return [
            'days' => $days,
            'salah_breakdown' => $totalSalah,
            'quran_pages' => $totalQuran,
            'fasting_completed' => $totalFasting,
            'todos_completed' => $totalTodos,
            'current_streak' => $streak['current'],
            'longest_streak' => $streak['longest'],
        ];
    }

    /**
     * @return array{days: array<int, array{date: string, completion_pct: float, done: int, total: int, quran_pages: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, current_streak: int, longest_streak: int, gregorian_month: string, hijri_month: string}
     */
    private function computeMonthly(User $user, CarbonImmutable $monthStart, bool $isHijri): array
    {
        if ($isHijri) {
            return $this->computeHijriMonthly($user, $monthStart);
        }

        $monthEnd = $monthStart->endOfMonth();
        $days = [];
        $totalSalah = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0];
        $totalQuran = 0;
        $totalFasting = 0;
        $totalTodos = 0;

        for ($date = $monthStart->startOfDay(); $date->lte($monthEnd); $date = $date->addDay()) {
            $tasksTotal = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->whereIn('status', ['done', 'skipped', 'missed'])
                ->count();
            $tasksDone = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->where('status', 'done')
                ->count();
            $pages = (int) $user->quranProgress()
                ->whereDate('date', $date->toDateString())
                ->sum('pages_read');

            $days[] = [
                'date' => $date->toDateString(),
                'completion_pct' => $tasksTotal > 0 ? round(($tasksDone / $tasksTotal) * 100, 1) : 0.0,
                'done' => $tasksDone,
                'total' => $tasksTotal,
                'quran_pages' => $pages,
            ];

            $totalQuran += $pages;
        }

        $salahLogs = $user->salahLogs()
            ->whereDate('date', '>=', $monthStart->toDateString())
            ->whereDate('date', '<=', $monthEnd->toDateString())
            ->get();

        foreach ($salahLogs as $log) {
            $s = $log->status;
            if (isset($totalSalah[$s])) {
                $totalSalah[$s]++;
            }
        }

        $totalFasting = $user->fastingLogs()
            ->whereDate('date', '>=', $monthStart->toDateString())
            ->whereDate('date', '<=', $monthEnd->toDateString())
            ->where('status', 'completed')
            ->count();

        $totalTodos = $user->todos()
            ->where('status', 'done')
            ->whereDate('completed_at', '>=', $monthStart->toDateString())
            ->whereDate('completed_at', '<=', $monthEnd->toDateString())
            ->count();

        $streak = $this->streak->global($user, $monthEnd);

        $hijriDate = $this->hijri->toHijriWithOffset($monthStart, $user->hijri_offset);

        return [
            'days' => $days,
            'salah_breakdown' => $totalSalah,
            'quran_pages' => $totalQuran,
            'fasting_completed' => $totalFasting,
            'todos_completed' => $totalTodos,
            'current_streak' => $streak['current'],
            'longest_streak' => $streak['longest'],
            'gregorian_month' => $monthStart->format('F Y'),
            'hijri_month' => "{$hijriDate['month']} AH {$hijriDate['year']}",
        ];
    }

    /**
     * @return array{days: array<int, array{date: string, completion_pct: float, done: int, total: int, quran_pages: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, current_streak: int, longest_streak: int, gregorian_month: string, hijri_month: string}
     */
    private function computeHijriMonthly(User $user, CarbonImmutable $monthStart): array
    {
        $hijriDate = $this->hijri->toHijriWithOffset($monthStart, $user->hijri_offset);
        $hijriYear = $hijriDate['year'];
        $hijriMonth = $hijriDate['month'];
        $monthLength = $this->hijri->hijriMonthLength($hijriYear, $hijriMonth);

        $days = [];
        $totalSalah = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0];
        $totalQuran = 0;
        $totalFasting = 0;
        $totalTodos = 0;

        $gregStart = $this->hijri->toGregorian($hijriYear, $hijriMonth, 1);
        $gregEnd = $this->hijri->toGregorian($hijriYear, $hijriMonth, $monthLength);

        for ($date = $gregStart; $date->lte($gregEnd); $date = $date->addDay()) {
            $tasksTotal = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->whereIn('status', ['done', 'skipped', 'missed'])
                ->count();
            $tasksDone = $user->taskInstances()
                ->whereDate('due_date', $date->toDateString())
                ->where('status', 'done')
                ->count();
            $pages = (int) $user->quranProgress()
                ->whereDate('date', $date->toDateString())
                ->sum('pages_read');

            $days[] = [
                'date' => $date->toDateString(),
                'completion_pct' => $tasksTotal > 0 ? round(($tasksDone / $tasksTotal) * 100, 1) : 0.0,
                'done' => $tasksDone,
                'total' => $tasksTotal,
                'quran_pages' => $pages,
            ];

            $totalQuran += $pages;
        }

        $salahLogs = $user->salahLogs()
            ->whereDate('date', '>=', $gregStart->toDateString())
            ->whereDate('date', '<=', $gregEnd->toDateString())
            ->get();

        foreach ($salahLogs as $log) {
            $s = $log->status;
            if (isset($totalSalah[$s])) {
                $totalSalah[$s]++;
            }
        }

        $totalFasting = $user->fastingLogs()
            ->whereDate('date', '>=', $gregStart->toDateString())
            ->whereDate('date', '<=', $gregEnd->toDateString())
            ->where('status', 'completed')
            ->count();

        $totalTodos = $user->todos()
            ->where('status', 'done')
            ->whereDate('completed_at', '>=', $gregStart->toDateString())
            ->whereDate('completed_at', '<=', $gregEnd->toDateString())
            ->count();

        $streak = $this->streak->global($user, $gregEnd);

        return [
            'days' => $days,
            'salah_breakdown' => $totalSalah,
            'quran_pages' => $totalQuran,
            'fasting_completed' => $totalFasting,
            'todos_completed' => $totalTodos,
            'current_streak' => $streak['current'],
            'longest_streak' => $streak['longest'],
            'gregorian_month' => $gregStart->format('M j').' - '.$gregEnd->format('M j, Y'),
            'hijri_month' => "{$hijriMonth} AH {$hijriYear}",
        ];
    }

    /**
     * @return array{months: array<int, array{month: string, done: int, total: int, quran_pages: int, fasting_completed: int, todos_completed: int}>, salah_breakdown: array{jamaat: int, alone: int, qada: int, missed: int}, quran_pages: int, fasting_completed: int, todos_completed: int, streak_heatmap: array<int, array{date: string, value: int}>, current_streak: int, longest_streak: int, goals: array<int, array{title: string, target: int, current: int, unit: string}>}
     */
    private function computeYearly(User $user, int $year, bool $isHijri): array
    {
        $months = [];
        $totalSalah = ['jamaat' => 0, 'alone' => 0, 'qada' => 0, 'missed' => 0];
        $totalQuran = 0;
        $totalFasting = 0;
        $totalTodos = 0;

        $heatmap = [];
        $daysInRow = [];

        if ($isHijri) {
            for ($m = 1; $m <= 12; $m++) {
                $gregStart = $this->hijri->toGregorian($year, $m, 1);
                $monthLen = $this->hijri->hijriMonthLength($year, $m);
                $gregEnd = $this->hijri->toGregorian($year, $m, $monthLen);

                $done = $user->taskInstances()
                    ->whereDate('due_date', '>=', $gregStart->toDateString())
                    ->whereDate('due_date', '<=', $gregEnd->toDateString())
                    ->where('status', 'done')
                    ->count();
                $total = $user->taskInstances()
                    ->whereDate('due_date', '>=', $gregStart->toDateString())
                    ->whereDate('due_date', '<=', $gregEnd->toDateString())
                    ->whereIn('status', ['done', 'skipped', 'missed'])
                    ->count();
                $pages = (int) $user->quranProgress()
                    ->whereDate('date', '>=', $gregStart->toDateString())
                    ->whereDate('date', '<=', $gregEnd->toDateString())
                    ->sum('pages_read');
                $fasts = $user->fastingLogs()
                    ->whereDate('date', '>=', $gregStart->toDateString())
                    ->whereDate('date', '<=', $gregEnd->toDateString())
                    ->where('status', 'completed')
                    ->count();
                $todos = $user->todos()
                    ->where('status', 'done')
                    ->whereDate('completed_at', '>=', $gregStart->toDateString())
                    ->whereDate('completed_at', '<=', $gregEnd->toDateString())
                    ->count();

                $months[] = [
                    'month' => (string) $m,
                    'done' => $done,
                    'total' => $total,
                    'quran_pages' => $pages,
                    'fasting_completed' => $fasts,
                    'todos_completed' => $todos,
                ];

                $totalQuran += $pages;
                $totalFasting += $fasts;
                $totalTodos += $todos;

                $doneDates = $user->taskInstances()
                    ->whereDate('due_date', '>=', $gregStart->toDateString())
                    ->whereDate('due_date', '<=', $gregEnd->toDateString())
                    ->where('status', 'done')
                    ->pluck('due_date')
                    ->map(fn ($d) => CarbonImmutable::parse($d)->toDateString())
                    ->unique()
                    ->values()
                    ->all();

                foreach ($doneDates as $d) {
                    $daysInRow[] = $d;
                }
            }
        } else {
            for ($m = 1; $m <= 12; $m++) {
                $mStart = CarbonImmutable::create($year, $m, 1, 0, 0, 0, 'UTC')->startOfMonth();
                $mEnd = $mStart->endOfMonth();

                $done = $user->taskInstances()
                    ->whereDate('due_date', '>=', $mStart->toDateString())
                    ->whereDate('due_date', '<=', $mEnd->toDateString())
                    ->where('status', 'done')
                    ->count();
                $total = $user->taskInstances()
                    ->whereDate('due_date', '>=', $mStart->toDateString())
                    ->whereDate('due_date', '<=', $mEnd->toDateString())
                    ->whereIn('status', ['done', 'skipped', 'missed'])
                    ->count();
                $pages = (int) $user->quranProgress()
                    ->whereDate('date', '>=', $mStart->toDateString())
                    ->whereDate('date', '<=', $mEnd->toDateString())
                    ->sum('pages_read');
                $fasts = $user->fastingLogs()
                    ->whereDate('date', '>=', $mStart->toDateString())
                    ->whereDate('date', '<=', $mEnd->toDateString())
                    ->where('status', 'completed')
                    ->count();
                $todos = $user->todos()
                    ->where('status', 'done')
                    ->whereDate('completed_at', '>=', $mStart->toDateString())
                    ->whereDate('completed_at', '<=', $mEnd->toDateString())
                    ->count();

                $months[] = [
                    'month' => (string) $m,
                    'done' => $done,
                    'total' => $total,
                    'quran_pages' => $pages,
                    'fasting_completed' => $fasts,
                    'todos_completed' => $todos,
                ];

                $totalQuran += $pages;
                $totalFasting += $fasts;
                $totalTodos += $todos;

                $doneDates = $user->taskInstances()
                    ->whereDate('due_date', '>=', $mStart->toDateString())
                    ->whereDate('due_date', '<=', $mEnd->toDateString())
                    ->where('status', 'done')
                    ->pluck('due_date')
                    ->map(fn ($d) => CarbonImmutable::parse($d)->toDateString())
                    ->unique()
                    ->values()
                    ->all();

                foreach ($doneDates as $d) {
                    $daysInRow[] = $d;
                }
            }
        }

        $salahLogs = $user->salahLogs()
            ->whereYear('date', $isHijri ? '=' : '=', $isHijri ? '=' : '=')
            ->get();

        if ($isHijri) {
            $yearStart = $this->hijri->toGregorian($year, 1, 1);
            $yearEnd = $this->hijri->toGregorian($year, 12, $this->hijri->hijriMonthLength($year, 12));
            $salahLogs = $user->salahLogs()
                ->whereDate('date', '>=', $yearStart->toDateString())
                ->whereDate('date', '<=', $yearEnd->toDateString())
                ->get();
        } else {
            $salahLogs = $user->salahLogs()
                ->whereYear('date', $year)
                ->get();
        }

        foreach ($salahLogs as $log) {
            $s = $log->status;
            if (isset($totalSalah[$s])) {
                $totalSalah[$s]++;
            }
        }

        $frequency = array_count_values($daysInRow);
        foreach ($frequency as $date => $count) {
            $heatmap[] = ['date' => $date, 'value' => min($count, 5)];
        }

        $endDate = $isHijri
            ? $this->hijri->toGregorian($year, 12, $this->hijri->hijriMonthLength($year, 12))
            : CarbonImmutable::create($year, 12, 31, 0, 0, 0, 'UTC');

        $streak = $this->streak->global($user, $endDate);

        $goals = Goal::query()
            ->where('user_id', $user->id)
            ->whereDate('starts_on', '<=', $endDate->toDateString())
            ->where(function ($q) use ($endDate) {
                $q->whereNull('ends_on')->orWhereDate('ends_on', '>=', $endDate->toDateString());
            })
            ->get()
            ->map(function ($goal) use ($isHijri, $year) {
                $progressService = app(GoalProgressService::class);
                $key = $progressService->periodKey(
                    $goal,
                    $isHijri
                        ? $this->hijri->toGregorian($year, 1, 1)
                        : CarbonImmutable::create($year, 1, 1, 0, 0, 0, 'UTC')
                );

                $current = $goal->goalProgress()
                    ->where('period_key', 'like', $key.'%')
                    ->sum('current_value');

                return [
                    'title' => $goal->title,
                    'target' => $goal->target_value,
                    'current' => (int) $current,
                    'unit' => $goal->unit,
                ];
            })
            ->values()
            ->all();

        return [
            'months' => $months,
            'salah_breakdown' => $totalSalah,
            'quran_pages' => $totalQuran,
            'fasting_completed' => $totalFasting,
            'todos_completed' => $totalTodos,
            'streak_heatmap' => $heatmap,
            'current_streak' => $streak['current'],
            'longest_streak' => $streak['longest'],
            'goals' => $goals,
        ];
    }
}
