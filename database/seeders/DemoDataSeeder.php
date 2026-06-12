<?php

namespace Database\Seeders;

use App\Actions\RecomputeQadaCounters;
use App\Models\Circle;
use App\Models\CircleMember;
use App\Models\DhikrSession;
use App\Models\Donation;
use App\Models\FastingLog;
use App\Models\Goal;
use App\Models\GoalProgress;
use App\Models\HifzItem;
use App\Models\QuranProgress;
use App\Models\Routine;
use App\Models\SalahLog;
use App\Models\TaskInstance;
use App\Models\Todo;
use App\Models\User;
use App\Services\GoalProgressService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Generates ~200+ realistic rows per module for a single demo user
 * (test@example.com) so the entire UI can be explored visually.
 *
 * Idempotent: deletes the demo user's prior demo data first, then re-inserts.
 * Routines seeded with real anchors/recurrences (TodayResolver works on them).
 * Qada counters derived via RecomputeQadaCounters so they stay consistent
 * with the seeded salah_logs.
 *
 * Run: php artisan db:seed --class=Database\\Seeders\\DemoDataSeeder
 * Or:  php artisan migrate:fresh --seed (also calls DatabaseSeeder)
 */
class DemoDataSeeder extends Seeder
{
    private const DEMO_EMAIL = 'test@example.com';

    private const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    /** Status weights so the dashboard heatmap looks lived-in, not perfect. */
    private const SALAH_STATUS_WEIGHTS = [
        'jamaat' => 55,
        'alone' => 25,
        'qada' => 8,
        'missed' => 12,
    ];

    private CarbonImmutable $today;

    private User $user;

    public function __construct(
        private readonly RecomputeQadaCounters $recomputeQada,
        private readonly GoalProgressService $goalProgress,
    ) {
        $this->today = CarbonImmutable::now('UTC')->startOfDay();
    }

    public function run(): void
    {
        $this->user = $this->ensureUser();

        $this->command->info("Seeding demo data for {$this->user->email}…");

        DB::transaction(function () {
            $this->purgeUserDemoData();
            $routines = $this->seedRoutines();
            $this->seedSalahLogs();            // 600+ rows
            $this->seedTaskInstances($routines); // 250+ rows
            $todoLists = $this->seedTodoLists();
            $this->seedTodos($todoLists);      // 200+ rows
            $this->seedQuranProgress();        // 120+ rows
            $this->seedFastingLogs();          // 80+ rows
            $this->seedDhikrSessions();        // 200+ rows
            $this->seedHifzItems();            // 30+ items
            $goals = $this->seedGoals();
            $this->seedGoalProgress($goals);
            $this->seedDonations();            // 6
            $this->seedCircles();              // 3 circles + 12 members
        });

        // qada_counters derived from raw logs (idempotent).
        $this->recomputeQada->__invoke($this->user, $this->user->timezone
            ? CarbonImmutable::now($this->user->timezone)
            : null);

        $this->command->info('Done. Row counts:');
        $this->reportCounts();
    }

    private function ensureUser(): User
    {
        return User::firstOrCreate(
            ['email' => self::DEMO_EMAIL],
            [
                'name' => 'Demo User',
                'display_name' => 'Demo',
                'password' => bcrypt('password'),
                'email_verified_at' => $this->today,
                'timezone' => 'Asia/Dhaka',
                'locale' => 'en',
                'theme' => 'deenmate',
                'lat' => 23.8103,
                'lng' => 90.4125,
                'geohash' => 'wh0r3q',
                'calc_method' => 'karachi',
                'asr_method' => 'hanafi',
                'high_lat_rule' => 'none',
                'hijri_offset' => 0,
                'onboarded_at' => $this->today->subMonths(8),
                'notification_preferences' => User::defaultNotificationPreferences(),
            ],
        );
    }

    private function purgeUserDemoData(): void
    {
        // Order matters: respect FKs where present.
        GoalProgress::whereIn('goal_id', $this->user->goals()->pluck('id'))->delete();
        $this->user->goals()->delete();
        $this->user->hifzItems()->delete();
        $this->user->dhikrSessions()->delete();
        $this->user->fastingLogs()->delete();
        $this->user->quranProgress()->delete();

        // Subtasks first (FK self-ref), then todos, then their lists.
        $this->user->todos()->whereNotNull('parent_id')->delete();
        $this->user->todos()->delete();
        $this->user->todoLists()->delete();

        $this->user->taskInstances()->delete();
        $this->user->routines()->delete();
        $this->user->salahLogs()->delete();
        $this->user->qadaCounters()->delete();
        Donation::where('user_id', $this->user->id)->delete();

        // Circles owned by user + memberships.
        $ownedCircleIds = Circle::where('owner_id', $this->user->id)->pluck('id');
        if ($ownedCircleIds->isNotEmpty()) {
            CircleMember::whereIn('circle_id', $ownedCircleIds)->delete();
            Circle::whereIn('id', $ownedCircleIds)->delete();
        }
        CircleMember::where('user_id', $this->user->id)->delete();
    }

    private function seedRoutines(): array
    {
        $routines = [
            ['title' => 'Fajr Salah', 'category' => 'salah', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'fajr', 'offset_minutes' => 0, 'reminder_enabled' => true, 'nag_mode' => true],
            ['title' => 'Dhuhr Salah', 'category' => 'salah', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'dhuhr', 'offset_minutes' => 0, 'reminder_enabled' => true],
            ['title' => 'Asr Salah', 'category' => 'salah', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'asr', 'offset_minutes' => 0, 'reminder_enabled' => true],
            ['title' => 'Maghrib Salah', 'category' => 'salah', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'maghrib', 'offset_minutes' => 0, 'reminder_enabled' => true],
            ['title' => 'Isha Salah', 'category' => 'salah', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'isha', 'offset_minutes' => 0, 'reminder_enabled' => true],
            ['title' => 'Morning Adhkar', 'category' => 'adhkar', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'fajr', 'offset_minutes' => 15, 'reminder_enabled' => true],
            ['title' => 'Evening Adhkar', 'category' => 'adhkar', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'asr', 'offset_minutes' => 15, 'reminder_enabled' => true],
            ['title' => 'Surah Al-Mulk', 'category' => 'quran', 'recurrence' => ['freq' => 'daily'], 'anchor' => 'isha', 'offset_minutes' => 30, 'reminder_enabled' => true],
            ['title' => 'Daily Quran Reading', 'category' => 'quran', 'recurrence' => ['freq' => 'daily'], 'fixed_time' => '20:00', 'reminder_enabled' => true],
            ['title' => 'Tasbih (33/33/34)', 'category' => 'general', 'recurrence' => ['freq' => 'daily'], 'fixed_time' => '21:30', 'reminder_enabled' => false],
            ['title' => 'Jumu\'ah Prep', 'category' => 'salah', 'recurrence' => ['freq' => 'weekly', 'days' => ['fri']], 'fixed_time' => '12:00', 'reminder_enabled' => true],
            ['title' => 'Weekend Quran Review', 'category' => 'quran', 'recurrence' => ['freq' => 'weekly', 'days' => ['sat']], 'fixed_time' => '10:00', 'reminder_enabled' => true],
        ];

        $created = [];
        foreach ($routines as $r) {
            $created[$r['title']] = $this->user->routines()->create(array_merge($r, [
                'starts_on' => $this->today->subMonths(6)->toDateString(),
                'is_active' => true,
            ]));
        }

        $this->command->info('  routines: '.count($created));

        return $created;
    }

    private function seedSalahLogs(): void
    {
        $statuses = [];
        foreach (self::SALAH_STATUS_WEIGHTS as $s => $w) {
            for ($i = 0; $i < $w; $i++) {
                $statuses[] = $s;
            }
        }

        $rows = [];
        // 120 days × 5 prayers = 600 rows.
        for ($d = 0; $d < 120; $d++) {
            $date = $this->today->subDays($d)->toDateString();
            foreach (self::PRAYERS as $prayer) {
                $rows[] = [
                    'user_id' => $this->user->id,
                    'date' => $date,
                    'prayer' => $prayer,
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => $this->today,
                    'updated_at' => $this->today,
                ];
            }
        }

        foreach (array_chunk($rows, 250) as $chunk) {
            SalahLog::insert($chunk);
        }

        $this->command->info('  salah_logs: '.count($rows));
    }

    private function seedTaskInstances(array $routines): void
    {
        $rows = [];
        // Last 30 days for every routine — gives the dashboard activity heatmap plenty to chew on.
        foreach ($routines as $routine) {
            for ($d = 0; $d < 30; $d++) {
                $date = $this->today->subDays($d);
                // Skip with some probability so streaks/misses exist.
                $r = mt_rand(0, 100);
                if ($r < 12) {
                    continue; // no instance materialised
                }
                $status = $r < 88 ? 'done' : ($r < 95 ? 'skipped' : 'missed');
                $rows[] = [
                    'user_id' => $this->user->id,
                    'routine_id' => $routine->id,
                    'title' => $routine->title,
                    'due_date' => $date->toDateString(),
                    'due_at' => $date,
                    'status' => $status,
                    'completed_at' => $status === 'done' ? $date->addHours(mt_rand(0, 14)) : null,
                    'note' => null,
                    'created_at' => $this->today,
                    'updated_at' => $this->today,
                ];
            }
        }

        // De-duplicate (user, routine, due_date) — the unique index in the schema.
        $unique = [];
        foreach ($rows as $row) {
            $key = $row['user_id'].':'.$row['routine_id'].':'.$row['due_date'];
            $unique[$key] = $row;
        }
        $rows = array_values($unique);

        foreach (array_chunk($rows, 250) as $chunk) {
            TaskInstance::insert($chunk);
        }

        $this->command->info('  task_instances: '.count($rows));
    }

    private function seedTodoLists(): array
    {
        $lists = [
            ['name' => 'Personal', 'color' => 'primary', 'sort_order' => 0],
            ['name' => 'Work', 'color' => 'info', 'sort_order' => 1],
            ['name' => 'Family', 'color' => 'success', 'sort_order' => 2],
            ['name' => 'Deen', 'color' => 'warning', 'sort_order' => 3],
        ];

        $created = [];
        foreach ($lists as $l) {
            $created[$l['name']] = $this->user->todoLists()->create($l);
        }

        $this->command->info('  todo_lists: '.count($created));

        return $created;
    }

    private function seedTodos(array $lists): void
    {
        $titles = [
            'Call sister', 'Renew library books', 'Pick up groceries', 'Reply to emails',
            'Pay electricity bill', 'Schedule doctor visit', 'Fix kitchen tap', 'Read 20 pages',
            'Update resume', 'Plan weekend trip', 'Send Eid cards', 'Buy gift for nephew',
            'Clean the garage', 'Finish online course', 'Backup phone photos', 'Review budget',
            'Water the plants', 'Walk 5000 steps', 'Practice Surah Kahf', 'Memorize last 10 ayahs',
            'Donate old clothes', 'Prepare Iftar', 'Visit sick neighbor', 'Make du\'a list',
            'Plan iftar menu', 'Charity box fill', 'Send thank-you notes', 'Refill prescriptions',
            'Reorganize bookshelf', 'Schedule car service', 'Write in journal', 'Plan Umrah trip',
        ];
        $priorities = ['low', 'normal', 'high', 'urgent'];
        $weights = [20, 50, 25, 5];

        $rows = [];
        for ($i = 0; $i < 220; $i++) {
            $list = $lists[array_rand($lists)];
            $bucket = $this->weightedPick($weights);
            $status = match (true) {
                $i % 3 === 0 => 'done',
                $i % 11 === 0 => 'cancelled',
                default => 'pending',
            };
            $completedAt = $status === 'done' ? $this->today->subDays(mt_rand(0, 60))->setTime(mt_rand(8, 21), mt_rand(0, 59)) : null;
            $dueOffset = mt_rand(-15, 21); // some overdue, some upcoming, most today-ish
            $due = $this->today->addDays($dueOffset);
            $rows[] = [
                'user_id' => $this->user->id,
                'todo_list_id' => $list->id,
                'parent_id' => null,
                'title' => $titles[array_rand($titles)].($i > count($titles) ? ' (#'.($i + 1).')' : ''),
                'description' => mt_rand(0, 1) ? 'Reminder to follow up next week.' : null,
                'priority' => $priorities[$bucket],
                'due_date' => $due->toDateString(),
                'due_at' => $due->setTime(mt_rand(8, 21), 0),
                'status' => $status,
                'completed_at' => $completedAt,
                'sort_order' => $i,
                'created_at' => $this->today->subDays(mt_rand(0, 90)),
                'updated_at' => $this->today,
            ];
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            Todo::insert($chunk);
        }

        $this->command->info('  todos: '.count($rows));
    }

    private function seedQuranProgress(): void
    {
        $rows = [];
        $page = 1;
        // 120 days of reading, with a few skipped days to look realistic.
        for ($d = 0; $d < 120; $d++) {
            if (mt_rand(0, 100) < 10) {
                continue;
            }
            $pagesToday = mt_rand(1, 5);
            $date = $this->today->subDays($d)->toDateString();
            $rows[] = [
                'user_id' => $this->user->id,
                'date' => $date,
                'pages_read' => $pagesToday,
                'from_ref' => $this->pageToRef($page),
                'to_ref' => $this->pageToRef($page + $pagesToday - 1),
            ];
            $page += $pagesToday;
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            QuranProgress::insert($chunk);
        }

        $this->command->info('  quran_progress: '.count($rows));
    }

    private function seedFastingLogs(): void
    {
        $rows = [];
        // Mon/Thu + Ayyam al-Beedh (13-15 of each Hijri month) + a few nafl.
        for ($d = 0; $d < 180; $d++) {
            $date = $this->today->subDays($d);
            $dow = $date->dayOfWeek; // 1=Mon, 4=Thu
            $day = $date->day;
            $type = null;
            if ($dow === 1 || $dow === 4) {
                $type = 'monday_thursday';
            } elseif (in_array($day, [13, 14, 15], true)) {
                $type = 'ayyam_beedh';
            } elseif (mt_rand(0, 200) === 0) {
                $type = 'nafl';
            }
            if ($type === null) {
                continue;
            }
            $rows[] = [
                'user_id' => $this->user->id,
                'date' => $date->toDateString(),
                'type' => $type,
                'status' => mt_rand(0, 100) < 90 ? 'completed' : 'broken',
                'created_at' => $this->today,
                'updated_at' => $this->today,
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            FastingLog::insert($chunk);
        }

        $this->command->info('  fasting_logs: '.count($rows));
    }

    private function seedDhikrSessions(): void
    {
        $slugs = ['subhanallah', 'alhamdulillah', 'allahu_akbar', 'post_salah_tasbih', 'istighfar', 'salawat'];
        $rows = [];
        for ($d = 0; $d < 35; $d++) {
            $date = $this->today->subDays($d)->toDateString();
            // 6 sessions per day on average across 6 slugs = 210 rows.
            for ($i = 0; $i < 6; $i++) {
                $slug = $slugs[array_rand($slugs)];
                $target = [33, 33, 34, 100, 100, 100][array_rand([0, 1, 2, 3, 4, 5])];
                $rows[] = [
                    'user_id' => $this->user->id,
                    'slug' => $slug,
                    'count' => mt_rand($target - 5, $target),
                    'target' => $target,
                    'date' => $date,
                    'created_at' => $this->today,
                    'updated_at' => $this->today,
                ];
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DhikrSession::insert($chunk);
        }

        $this->command->info('  dhikr_sessions: '.count($rows));
    }

    private function seedHifzItems(): void
    {
        $items = [
            ['1:1', '1:7'],
            ['2:255', '2:257'], // Ayat al-Kursi
            ['18:1', '18:5'],
            ['36:1', '36:12'], // Surah Ya-Sin opener
            ['55:1', '55:13'], // Ar-Rahman opener
            ['67:1', '67:10'], // Al-Mulk opener
            ['112:1', '112:4'],
            ['113:1', '113:5'],
            ['114:1', '114:6'],
            ['97:1', '97:5'],
        ];

        $rows = [];
        foreach ($items as [$start, $end]) {
            $ease = mt_rand(220, 280);
            $intervalDays = mt_rand(3, 30);
            $nextReview = $this->today->addDays(mt_rand(-10, 14));
            $rows[] = [
                'user_id' => $this->user->id,
                'ref_start' => $start,
                'ref_end' => $end,
                'status' => 'review',
                'ease' => $ease,
                'next_review_on' => $nextReview->toDateString(),
                'interval_days' => $intervalDays,
                'created_at' => $this->today->subMonths(3),
                'updated_at' => $this->today,
            ];
        }
        // Add more "learning" items so the list is fuller.
        for ($i = 1; $i <= 20; $i++) {
            $rows[] = [
                'user_id' => $this->user->id,
                'ref_start' => mt_rand(1, 114).':'.mt_rand(1, 50),
                'ref_end' => mt_rand(1, 114).':'.mt_rand(1, 50),
                'status' => 'learning',
                'ease' => mt_rand(180, 240),
                'next_review_on' => $this->today->addDays(mt_rand(-5, 10))->toDateString(),
                'interval_days' => 1,
                'created_at' => $this->today->subMonths(2),
                'updated_at' => $this->today,
            ];
        }

        HifzItem::insert($rows);
        $this->command->info('  hifz_items: '.count($rows));
    }

    private function seedGoals(): array
    {
        $goals = [
            ['title' => 'Daily Quran Page', 'period' => 'daily', 'period_basis' => 'gregorian', 'target_value' => 1, 'unit' => 'pages', 'metric_source' => 'quran_pages', 'linked_routine_ids' => null],
            ['title' => '30-day Jamaat Streak', 'period' => 'daily', 'period_basis' => 'gregorian', 'target_value' => 5, 'unit' => 'count', 'metric_source' => 'salah_jamaat', 'linked_routine_ids' => null],
            ['title' => 'Monthly Quran Khatm', 'period' => 'monthly', 'period_basis' => 'gregorian', 'target_value' => 600, 'unit' => 'pages', 'metric_source' => 'quran_pages', 'linked_routine_ids' => null],
            ['title' => 'Monthly Sunnah Fasts', 'period' => 'monthly', 'period_basis' => 'gregorian', 'target_value' => 8, 'unit' => 'count', 'metric_source' => 'fasts', 'linked_routine_ids' => null],
            ['title' => 'Yearly Quran Khatm', 'period' => 'yearly', 'period_basis' => 'hijri', 'target_value' => 604, 'unit' => 'pages', 'metric_source' => 'quran_pages', 'linked_routine_ids' => null],
            ['title' => 'Daily Routine Completions', 'period' => 'daily', 'period_basis' => 'gregorian', 'target_value' => 12, 'unit' => 'count', 'metric_source' => 'routine_completions', 'linked_routine_ids' => null],
        ];

        $created = [];
        foreach ($goals as $g) {
            $created[$g['title']] = $this->user->goals()->create(array_merge($g, [
                'starts_on' => $this->today->subMonths(6)->toDateString(),
            ]));
        }
        $this->command->info('  goals: '.count($created));

        return $created;
    }

    private function seedGoalProgress(array $goals): void
    {
        $rows = [];
        // Daily goals: 30 days of progress.
        foreach (['Daily Quran Page', '30-day Jamaat Streak', 'Daily Routine Completions'] as $title) {
            $goal = $goals[$title];
            for ($d = 0; $d < 30; $d++) {
                $date = $this->today->subDays($d);
                $key = $this->goalProgress->periodKey($goal, $date);
                $rows[] = [
                    'goal_id' => $goal->id,
                    'period_key' => $key,
                    'current_value' => mt_rand(0, (int) $goal->target_value),
                    'created_at' => $this->today,
                    'updated_at' => $this->today,
                ];
            }
        }
        // Monthly goals: 6 months of progress.
        foreach (['Monthly Quran Khatm', 'Monthly Sunnah Fasts'] as $title) {
            $goal = $goals[$title];
            for ($m = 0; $m < 6; $m++) {
                $date = $this->today->subMonths($m)->startOfMonth();
                $key = $this->goalProgress->periodKey($goal, $date);
                $rows[] = [
                    'goal_id' => $goal->id,
                    'period_key' => $key,
                    'current_value' => mt_rand(0, (int) $goal->target_value),
                    'created_at' => $this->today,
                    'updated_at' => $this->today,
                ];
            }
        }
        // Yearly goal: current period only.
        $yearly = $goals['Yearly Quran Khatm'];
        $rows[] = [
            'goal_id' => $yearly->id,
            'period_key' => $this->goalProgress->periodKey($yearly, $this->today),
            'current_value' => mt_rand(50, 250),
            'created_at' => $this->today,
            'updated_at' => $this->today,
        ];

        foreach (array_chunk($rows, 200) as $chunk) {
            GoalProgress::insert($chunk);
        }
        $this->command->info('  goal_progress: '.count($rows));
    }

    private function seedDonations(): void
    {
        $rows = [
            ['provider' => 'github', 'amount' => 5, 'currency' => 'USD', 'external_id' => 'gh_sponsor_'.uniqid(), 'donated_at' => $this->today->subMonths(6)],
            ['provider' => 'github', 'amount' => 5, 'currency' => 'USD', 'external_id' => 'gh_sponsor_'.uniqid(), 'donated_at' => $this->today->subMonths(5)],
            ['provider' => 'opencollective', 'amount' => 20, 'currency' => 'USD', 'external_id' => 'oc_'.uniqid(), 'donated_at' => $this->today->subMonths(4)],
            ['provider' => 'github', 'amount' => 10, 'currency' => 'USD', 'external_id' => 'gh_sponsor_'.uniqid(), 'donated_at' => $this->today->subMonths(3)],
            ['provider' => 'bkash', 'amount' => 500, 'currency' => 'BDT', 'external_id' => 'bkash_'.uniqid(), 'donated_at' => $this->today->subMonths(2)],
            ['provider' => 'github', 'amount' => 5, 'currency' => 'USD', 'external_id' => 'gh_sponsor_'.uniqid(), 'donated_at' => $this->today->subMonth()],
        ];
        foreach ($rows as $r) {
            Donation::create(array_merge($r, ['user_id' => $this->user->id]));
        }
        $this->command->info('  donations: '.count($rows));
    }

    private function seedCircles(): void
    {
        $circles = [
            ['name' => 'Family', 'share' => 'full'],
            ['name' => 'Local Brothers', 'share' => 'percent'],
            ['name' => 'Online Hifz Group', 'share' => 'streak_only'],
        ];

        $memberNames = [
            'Ahmad Khan', 'Yusuf Rahman', 'Bilal Hasan', 'Hamza Ali',
            'Ibrahim Siddiqui', 'Khalil Ahmed', 'Maryam Begum', 'Aisha Khan',
            'Hassan Iqbal', 'Zainab Haque', 'Omar Faruk', 'Sumaiya Akter',
        ];

        $memberUsers = [];
        foreach ($memberNames as $i => $name) {
            $memberUsers[] = User::firstOrCreate(
                ['email' => 'member'.($i + 1).'@example.com'],
                [
                    'name' => $name,
                    'password' => bcrypt('password'),
                    'email_verified_at' => $this->today,
                    'timezone' => 'Asia/Dhaka',
                ],
            );
        }

        $created = 0;
        foreach ($circles as $c) {
            $circle = Circle::create([
                'name' => $c['name'],
                'owner_id' => $this->user->id,
                'invite_code' => strtoupper(substr(md5(uniqid($c['name'], true)), 0, 8)),
            ]);
            CircleMember::create([
                'circle_id' => $circle->id,
                'user_id' => $this->user->id,
                'share_level' => 'full',
            ]);
            foreach (array_slice($memberUsers, 0, 4) as $mu) {
                CircleMember::firstOrCreate(
                    ['circle_id' => $circle->id, 'user_id' => $mu->id],
                    ['share_level' => $c['share']],
                );
            }
            $created++;
        }
        $this->command->info('  circles: '.$created);
        $this->command->info('  circle_members: '.CircleMember::whereIn('circle_id', Circle::where('owner_id', $this->user->id)->pluck('id'))->count());
    }

    private function pageToRef(int $page): string
    {
        // 604 pages, each surah has a known page — fake by mapping linearly to surah numbers.
        $surah = max(1, (int) ceil($page / 604 * 114));
        $ayah = mt_rand(1, 30);

        return $surah.':'.$ayah;
    }

    private function weightedPick(array $weights): int
    {
        $total = array_sum($weights);
        $pick = mt_rand(1, $total);
        $acc = 0;
        foreach ($weights as $i => $w) {
            $acc += $w;
            if ($pick <= $acc) {
                return $i;
            }
        }

        return array_key_last($weights);
    }

    private function reportCounts(): void
    {
        $goalIds = $this->user->goals()->pluck('id')->all();
        $rows = [
            'routines' => fn () => $this->user->routines()->count(),
            'task_instances' => fn () => $this->user->taskInstances()->count(),
            'salah_logs' => fn () => $this->user->salahLogs()->count(),
            'qada_counters' => fn () => $this->user->qadaCounters()->count(),
            'todo_lists' => fn () => $this->user->todoLists()->count(),
            'todos' => fn () => $this->user->todos()->count(),
            'quran_progress' => fn () => $this->user->quranProgress()->count(),
            'fasting_logs' => fn () => $this->user->fastingLogs()->count(),
            'dhikr_sessions' => fn () => $this->user->dhikrSessions()->count(),
            'hifz_items' => fn () => $this->user->hifzItems()->count(),
            'goals' => fn () => $this->user->goals()->count(),
            'goal_progress' => fn () => GoalProgress::whereIn('goal_id', $goalIds)->count(),
            'donations' => fn () => Donation::where('user_id', $this->user->id)->count(),
            'circles_owned' => fn () => Circle::where('owner_id', $this->user->id)->count(),
            'circle_memberships' => fn () => CircleMember::where('user_id', $this->user->id)->count(),
        ];
        foreach ($rows as $label => $fn) {
            $count = $fn();
            $this->command->info(sprintf('  %-20s %d', $label, $count));
        }
    }
}
