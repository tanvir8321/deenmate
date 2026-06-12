<?php

namespace App\Http\Controllers;

use App\Actions\RecordDhikr;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DhikrSessionController extends Controller
{
    public function store(Request $request, RecordDhikr $recordDhikr): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'required|string',
            'count' => 'required|integer|min:1',
            'target' => 'required|integer|min:1',
            'date' => 'required|date',
        ]);

        $result = $recordDhikr(
            user: $request->user(),
            slug: $validated['slug'],
            count: $validated['count'],
            target: $validated['target'],
            date: CarbonImmutable::parse($validated['date']),
        );

        return response()->json($result);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $session = $request->user()->dhikrSessions()->findOrFail($id);
        $session->delete();

        return response()->json(['ok' => true]);
    }
}
