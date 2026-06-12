<?php

namespace App\Http\Controllers;

use App\Actions\LogSalah;
use App\Models\SalahLog;
use App\Models\User;
use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SalahController extends Controller
{
    public function __construct(
        private readonly PrayerTimeService $prayerTimes,
        private readonly HijriCalendarService $hijri,
        private readonly LogSalah $logSalah,
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

        $currentStreak = $this->computeSalahStreak($user, $today);

        $weekStart = $today->startOfWeek();
        $weekLogs = SalahLog::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$weekStart->toDateString(), $today->toDateString()])
            ->whereIn('status', ['jamaat', 'alone'])
            ->count();

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

    private function computeSalahStreak(User $user, CarbonImmutable $today): int
    {
        return Cache::remember(
            "salah_streak:{$user->id}:{$today->toDateString()}",
            $today->endOfDay(),
            function () use ($user, $today) {
                $streak = 0;
                $cursor = $today->startOfDay();

                while (true) {
                    $completed = SalahLog::query()
                        ->where('user_id', $user->id)
                        ->whereDate('date', $cursor->toDateString())
                        ->whereIn('status', ['jamaat', 'alone'])
                        ->count();

                    if ($completed >= 5) {
                        $streak++;
                        $cursor = $cursor->subDay();
                    } else {
                        break;
                    }
                }

                return $streak;
            },
        );
    }
}
