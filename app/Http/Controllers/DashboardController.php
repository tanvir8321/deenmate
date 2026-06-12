<?php

namespace App\Http\Controllers;

use App\Services\HijriCalendarService;
use App\Services\PrayerTimeService;
use App\Services\TodayResolver;
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

        return Inertia::render('Dashboard', [
            'prayerTimes' => $prayerTimes,
            'hijriDate' => $hijriDate,
            'hijriEvent' => $this->hijri->event($today, $user->hijri_offset),
            'gregorianDate' => $today->toDateString(),
            'hasLocation' => $prayerTimes !== null,
            'day' => $this->today->for($user, $today),
        ]);
    }
}
