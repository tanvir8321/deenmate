<?php

namespace App\Console\Commands;

use App\Models\Donation;
use App\Models\GoalProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ExportUserData extends Command
{
    protected $signature = 'deenmate:export-data {userId : The user ID to export}';

    protected $description = 'Export all personal data for a user as JSON (GDPR-compliant)';

    public function handle(): int
    {
        $userId = (int) $this->argument('userId');

        $user = User::find($userId);

        if (! $user) {
            $this->error("User with ID {$userId} not found.");

            return self::FAILURE;
        }

        $this->info("Exporting data for {$user->name} ({$user->email})...");

        $profile = $user->only([
            'id', 'name', 'email', 'email_verified_at',
            'timezone', 'locale', 'geohash', 'lat', 'lng',
            'calc_method', 'asr_method', 'high_lat_rule', 'hijri_offset',
            'quiet_start', 'quiet_end', 'onboarded_at',
            'created_at', 'updated_at',
        ]);

        $routines = $user->routines()->get()->toArray();
        $taskInstances = $user->taskInstances()->get()->toArray();
        $todos = $user->todos()->with('subtasks')->get()->toArray();
        $salahLogs = $user->salahLogs()->get()->toArray();
        $fastingLogs = $user->fastingLogs()->get()->toArray();
        $quranProgress = $user->quranProgress()->get()->toArray();
        $hifzItems = $user->hifzItems()->get()->toArray();
        $goals = $user->goals()->get()->toArray();
        $goalProgress = GoalProgress::whereIn(
            'goal_id', $user->goals()->pluck('id')
        )->get()->toArray();
        $circleMemberships = $user->circleMembers()->with('circle')->get()->toArray();
        $donations = Donation::where('user_id', $userId)->get()->toArray();
        $dhikrSessions = $user->dhikrSessions()->get()->toArray();
        $qadaCounters = $user->qadaCounters()->get()->toArray();

        $payload = [
            'exported_at' => CarbonImmutable::now('UTC')->toIso8601ZuluString(),
            'application' => 'DeenMate',
            'version' => config('app.version', '1.0.0'),
            'user' => $profile,
            'routines' => $routines,
            'task_instances' => $taskInstances,
            'todos' => $todos,
            'salah_logs' => $salahLogs,
            'fasting_logs' => $fastingLogs,
            'quran_progress' => $quranProgress,
            'hifz_items' => $hifzItems,
            'goals' => $goals,
            'goal_progress' => $goalProgress,
            'circle_memberships' => $circleMemberships,
            'donations' => $donations,
            'dhikr_sessions' => $dhikrSessions,
            'qada_counters' => $qadaCounters,
        ];

        $date = CarbonImmutable::now('UTC')->format('Y-m-d');
        $filename = "exports/{$userId}-export-{$date}.json";

        Storage::disk('local')->put($filename, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        $path = Storage::disk('local')->path($filename);

        $this->info("Export complete: {$path}");
        $this->info('Fields exported: '.implode(', ', array_keys($payload)));

        return self::SUCCESS;
    }
}
