<?php

namespace App\Http\Controllers;

use App\Actions\LogFasting;
use App\Models\FastingLog;
use App\Services\HijriCalendarService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FastingController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $timezone = $user->timezone;
        $today = CarbonImmutable::now($timezone)->startOfDay();

        $hijri = app(HijriCalendarService::class);
        $isRamadan = $hijri->isRamadan($today, $user->hijri_offset);

        $todayLog = $user->fastingLogs()
            ->whereDate('date', $today->toDateString())
            ->first();

        $monthlyLogs = $user->fastingLogs()
            ->whereYear('date', $today->year)
            ->whereMonth('date', $today->month)
            ->get()
            ->keyBy(fn (FastingLog $log) => $log->date->toDateString());

        $qada = $user->qadaCounters()->where('kind', 'fast')->first();

        $monthlyDays = [];
        $daysInMonth = $today->daysInMonth;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dateKey = $today->format('Y-m').'-'.str_pad((string) $d, 2, '0', STR_PAD_LEFT);
            $log = $monthlyLogs->get($dateKey);
            $monthlyDays[] = [
                'day' => $d,
                'date' => $dateKey,
                'type' => $log->type ?? null,
                'status' => $log->status ?? null,
            ];
        }

        return Inertia::render('Fasting/Index', [
            'today_fast' => $todayLog ? ['type' => $todayLog->type, 'status' => $todayLog->status] : null,
            'monthly_days' => $monthlyDays,
            'qada' => $qada ? ['owed' => $qada->owed, 'repaid' => $qada->repaid] : null,
            'is_ramadan' => $isRamadan,
            'hijri_date' => $hijri->hijriDate($today, $user->hijri_offset)->format('%d %B %Y'),
        ]);
    }

    public function store(Request $request, LogFasting $logFasting): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|string|in:ramadan,monday_thursday,ayyam_beedh,qada,nafl,arafah,ashura',
            'status' => 'required|string|in:completed,broken,intended',
        ]);

        $result = $logFasting(
            user: $request->user(),
            date: CarbonImmutable::parse($validated['date']),
            type: $validated['type'],
            status: $validated['status'],
        );

        return response()->json($result);
    }
}
