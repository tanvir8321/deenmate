<?php

namespace App\Http\Controllers;

use App\Actions\ReviewHifzItem;
use App\Models\HifzItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class HifzController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $today = CarbonImmutable::today()->toDateString();

        $items = HifzItem::where('user_id', $user->id)
            ->orderBy('next_review_on')
            ->get();

        $dueItems = $items->filter(fn ($item) => $item->next_review_on->toDateString() <= $today);
        $learningItems = $items->filter(fn ($item) => $item->status === 'learning');
        $reviewItems = $items->filter(fn ($item) => $item->status === 'review');

        return inertia('Hifz/Index', [
            'dueItems' => $dueItems->values(),
            'learningItems' => $learningItems->values(),
            'reviewItems' => $reviewItems->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ref_start' => 'required|string|max:255',
            'ref_end' => 'required|string|max:255',
            'status' => 'required|in:learning,review',
        ]);

        auth()->user()->hifzItems()->create([
            'ref_start' => $validated['ref_start'],
            'ref_end' => $validated['ref_end'],
            'status' => $validated['status'],
            'ease' => 250,
            'interval_days' => 1,
            'next_review_on' => CarbonImmutable::today(),
        ]);

        return redirect()->back();
    }

    public function review(Request $request, ReviewHifzItem $action): RedirectResponse
    {
        $validated = $request->validate([
            'hifz_item_id' => 'required|integer|exists:hifz_items,id',
            'quality' => 'required|integer|min:0|max:5',
        ]);

        $action(auth()->user(), $validated['hifz_item_id'], $validated['quality']);

        return redirect()->back();
    }
}
