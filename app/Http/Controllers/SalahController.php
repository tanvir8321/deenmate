<?php

namespace App\Http\Controllers;

use App\Actions\LogSalah;
use App\Actions\RepayQada;
use App\Models\QadaCounter;
use App\Models\SalahLog;
use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use App\Services\SalahAnalyticsService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalahController extends Controller
{
    public function __construct(
        private readonly PrayerTimeService $prayerTimes,
        private readonly HijriCalendarService $hijri,
        private readonly LogSalah $logSalah,
        private readonly SalahAnalyticsService $analytics,
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

        $todayLogs = SalahLog::query()
            ->where('user_id', $user->id)
            ->whereDate('date', $today->toDateString())
            ->get()
            ->keyBy('prayer');

        $currentStreak = $this->analytics->currentStreak($user, $today);

        $weekStart = $today->startOfWeek();
        $weekLogs = SalahLog::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$weekStart->toDateString(), $today->toDateString()])
            ->whereIn('status', ['jamaat', 'alone'])
            ->count();

        $heatmap = $this->analytics->heatmap($user, 90, $today);
        $perPrayer = $this->analytics->perPrayerConsistency(
            $user,
            $today->subDays(29),
            $today,
        );
        $monthlyBreakdown = $this->analytics->monthlyBreakdown($user, 6, $today);

        $qadaCounters = $user->qadaCounters()->get()->keyBy('kind');
        $qadaSummary = $this->qadaSummary($qadaCounters);

        return Inertia::render('Salah/Index', [
            'prayerTimes' => $prayerTimes,
            'todayLogs' => $todayLogs->map(fn ($log) => [
                'prayer' => $log->prayer,
                'status' => $log->status,
            ])->all(),
            'currentStreak' => $currentStreak,
            'hijriDate' => $hijriDate,
            'hijriEvent' => $this->hijri->event($today, $user->hijri_offset),
            'gregorianDate' => $today->toDateString(),
            'weeklyCount' => $weekLogs,
            'heatmap' => $heatmap,
            'perPrayer' => $perPrayer,
            'monthlyBreakdown' => $monthlyBreakdown,
            'qadaSummary' => $qadaSummary,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'prayer' => 'required|in:fajr,dhuhr,asr,maghrib,isha',
            'status' => 'required|in:jamaat,alone,qada,missed',
        ]);

        $user = $request->user();
        $date = CarbonImmutable::parse($validated['date'], $user->timezone)->startOfDay();

        ($this->logSalah)(
            $user,
            $date,
            $validated['prayer'],
            $validated['status'],
        );

        return back();
    }

    public function repayQada(Request $request, RepayQada $repay): RedirectResponse
    {
        $allowedKinds = array_merge(SalahAnalyticsService::SALAH_KINDS, ['fast']);

        $validated = $request->validate([
            'kind' => ['required', 'string', Rule::in($allowedKinds)],
            'count' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        $count = (int) ($validated['count'] ?? 1);

        $repay(
            $request->user(),
            $validated['kind'],
            $count,
        );

        return back();
    }

    /**
     * @param  Collection<int, QadaCounter>  $counters
     * @return array{owed: int, repaid: int, outstanding: int, by_prayer: array<string, array{owed: int, repaid: int, outstanding: int}>, fast: array{owed: int, repaid: int, outstanding: int}}
     */
    private function qadaSummary($counters): array
    {
        $byPrayer = [];
        foreach (SalahAnalyticsService::PRAYERS as $p) {
            $row = $counters->get('salah_'.$p);
            $owed = (int) ($row->owed ?? 0);
            $repaid = (int) ($row->repaid ?? 0);
            $byPrayer[$p] = [
                'owed' => $owed,
                'repaid' => $repaid,
                'outstanding' => max(0, $owed - $repaid),
            ];
        }

        $fastRow = $counters->get('fast');
        $fastOwed = (int) ($fastRow->owed ?? 0);
        $fastRepaid = (int) ($fastRow->repaid ?? 0);
        $fast = [
            'owed' => $fastOwed,
            'repaid' => $fastRepaid,
            'outstanding' => max(0, $fastOwed - $fastRepaid),
        ];

        $owed = array_sum(array_map(fn ($r) => $r['owed'], $byPrayer)) + $fast['owed'];
        $repaid = array_sum(array_map(fn ($r) => $r['repaid'], $byPrayer)) + $fast['repaid'];

        return [
            'owed' => $owed,
            'repaid' => $repaid,
            'outstanding' => max(0, $owed - $repaid),
            'by_prayer' => $byPrayer,
            'fast' => $fast,
        ];
    }
}
