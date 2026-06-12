<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\User;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Creates or updates a routine, normalizing the recurrence rule to
 * only the keys valid for its freq.
 */
class SaveRoutine
{
    private const RULE_KEYS = [
        'daily' => [],
        'weekly' => ['days'],
        'monthly' => ['day_of_month'],
        'yearly' => ['month', 'day'],
        'hijri_monthly' => ['hijri_days'],
        'hijri_yearly' => ['hijri_month', 'hijri_day'],
        'interval' => ['every_days'],
    ];

    /**
     * @param  array<string, mixed>  $data
     */
    public function __invoke(User $user, array $data, ?Routine $routine = null): Routine
    {
        $data['recurrence'] = $this->normalizeRule($data['recurrence']);

        if ($routine === null) {
            $routine = new Routine(['user_id' => $user->id]);
        }

        $routine->fill($data);
        $routine->user_id = $user->id;

        if ($routine->anchor !== null) {
            $routine->fixed_time = null;
        }

        $routine->save();

        TodayResolver::bust($user->id, CarbonImmutable::now($user->timezone)->toDateString());

        return $routine->refresh();
    }

    /**
     * @param  array<string, mixed>  $rule
     * @return array<string, mixed>
     */
    private function normalizeRule(array $rule): array
    {
        $freq = $rule['freq'];
        $keep = ['freq' => $freq];

        foreach (self::RULE_KEYS[$freq] as $key) {
            if (array_key_exists($key, $rule) && $rule[$key] !== null) {
                $keep[$key] = $rule[$key];
            }
        }

        return $keep;
    }
}
