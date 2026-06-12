<?php

namespace App\Actions;

use App\Models\Routine;
use App\Models\RoutineTemplate;
use App\Models\User;
use App\Services\TodayResolver;
use Carbon\CarbonImmutable;

/**
 * Installs a routine_template's payload as user routines.
 * Increments install_count on the template.
 */
class InstallRoutinePack
{
    public function __invoke(User $user, RoutineTemplate $template): int
    {
        $payload = $template->payload;
        $routines = $payload['routines'] ?? [];

        $installed = 0;
        $today = CarbonImmutable::now($user->timezone)->toDateString();

        foreach ($routines as $def) {
            Routine::create([
                'user_id' => $user->id,
                'title' => $def['title'],
                'category' => $def['category'] ?? 'general',
                'recurrence' => $def['recurrence'] ?? ['freq' => 'daily'],
                'anchor' => $def['anchor'] ?? null,
                'offset_minutes' => $def['offset_minutes'] ?? 0,
                'fixed_time' => $def['fixed_time'] ?? null,
                'reminder_enabled' => $def['reminder_enabled'] ?? false,
                'nag_mode' => $def['nag_mode'] ?? false,
                'starts_on' => $def['starts_on'] ?? $today,
                'ends_on' => $def['ends_on'] ?? null,
                'is_active' => true,
                'source_template_id' => $template->id,
            ]);

            $installed++;
        }

        $template->increment('install_count');

        TodayResolver::bust($user->id, $today);

        return $installed;
    }
}
