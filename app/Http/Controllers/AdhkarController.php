<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

class AdhkarController extends Controller
{
    public function index(): Response
    {
        /** @var list<array<string, mixed>> $content */
        $content = json_decode(file_get_contents(database_path('content/adhkar.json')), true);
        $user = request()->user();

        $todayProgress = $user->dhikrSessions()
            ->whereDate('date', CarbonImmutable::now($user->timezone)->toDateString())
            ->get()
            ->keyBy('slug');

        $grouped = collect($content)->groupBy('category')->map(function ($items, $category) use ($todayProgress) {
            return $items->map(function ($item) use ($todayProgress) {
                $session = $todayProgress->get($item['id']);

                return array_merge($item, [
                    'done' => $session->count ?? 0,
                    'completed' => ($session->count ?? 0) >= ($item['count'] ?? 1),
                ]);
            });
        });

        return Inertia::render('Adhkar/Index', [
            'groups' => $grouped,
        ]);
    }
}
