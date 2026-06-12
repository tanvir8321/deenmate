<?php

namespace App\Actions;

use App\Models\HifzItem;
use App\Models\User;
use Carbon\CarbonImmutable;

class ReviewHifzItem
{
    public function __invoke(User $user, int $hifzItemId, int $quality): CarbonImmutable
    {
        $item = HifzItem::where('user_id', $user->id)->findOrFail($hifzItemId);

        if ($quality >= 3) {
            $newInterval = max(1, (int) round($item->interval_days * $item->ease / 100));
            $newEase = max(130, $item->ease - 10);
            $nextReview = CarbonImmutable::today()->addDays($newInterval);

            $item->update([
                'interval_days' => $newInterval,
                'ease' => $newEase,
                'next_review_on' => $nextReview,
            ]);
        } else {
            $nextReview = CarbonImmutable::today()->addDay();
            $item->update([
                'interval_days' => 1,
                'next_review_on' => $nextReview,
            ]);
        }

        return $nextReview;
    }
}
