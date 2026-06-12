<?php

namespace App\Http\Controllers;

use App\Actions\LogQuranReading;
use App\Models\QuranProgress;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuranController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $timezone = $user->timezone;
        $today = CarbonImmutable::now($timezone)->startOfDay();

        $todayReading = $user->quranProgress()
            ->whereDate('date', $today->toDateString())
            ->first();

        $monthlyTotal = (int) $user->quranProgress()
            ->whereYear('date', $today->year)
            ->whereMonth('date', $today->month)
            ->sum('pages_read');

        $recentReadings = $user->quranProgress()
            ->whereDate('date', '>=', $today->subDays(7)->toDateString())
            ->orderBy('date', 'desc')
            ->get()
            ->map(function (QuranProgress $r): array {
                return [
                    'date' => $r->date->toDateString(),
                    'pages_read' => $r->pages_read,
                    'from_ref' => $r->from_ref,
                    'to_ref' => $r->to_ref,
                ];
            });

        return Inertia::render('Quran/Index', [
            'today' => $todayReading ? [
                'pages_read' => $todayReading->pages_read,
                'from_ref' => $todayReading->from_ref,
                'to_ref' => $todayReading->to_ref,
            ] : null,
            'monthly_total' => $monthlyTotal,
            'khatm_total' => 604,
            'recent_readings' => $recentReadings,
        ]);
    }

    public function store(Request $request, LogQuranReading $logReading): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'pages_read' => 'required|integer|min:1',
            'from_ref' => 'nullable|string',
            'to_ref' => 'nullable|string',
        ]);

        $result = $logReading(
            user: $request->user(),
            date: CarbonImmutable::parse($validated['date']),
            pagesRead: $validated['pages_read'],
            fromRef: $validated['from_ref'],
            toRef: $validated['to_ref'],
        );

        return response()->json($result);
    }
}
