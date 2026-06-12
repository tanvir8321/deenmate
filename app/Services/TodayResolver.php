<?php

namespace App\Services;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\Todo;
use App\Models\User;
use App\ValueObjects\PrayerTimes;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Builds a user's day from routines as VIRTUAL instances.
 * task_instances rows are written only on interaction (done/skip) or
 * at rollover (missed) — never pre-generated here.
 */
class TodayResolver
{
    public const OVERDUE_CAP = 10;

    public function __construct(
        private readonly RecurrenceEngine $recurrence,
        private readonly HijriCalendarService $hijri,
        private readonly PrayerTimeService $prayerTimes,
    ) {}

    /**
     * @return array{routines: list<array<string, mixed>>, todos: list<array<string, mixed>>, overdue: list<array<string, mixed>>}
     */
    public function for(User $user, CarbonImmutable $localDate): array
    {
        $localDate = $localDate->startOfDay();

        // Expires at the user's local midnight.
        return Cache::remember(
            self::cacheKey($user->id, $localDate->toDateString()),
            $localDate->endOfDay(),
            fn () => $this->build($user, $localDate),
        );
    }

    public static function cacheKey(int $userId, string $date): string
    {
        return "today:{$userId}:{$date}";
    }

    public static function bust(int $userId, string $date): void
    {
        Cache::forget(self::cacheKey($userId, $date));
    }

    /**
     * @return array{routines: list<array<string, mixed>>, todos: list<array<string, mixed>>, overdue: list<array<string, mixed>>}
     */
    private function build(User $user, CarbonImmutable $localDate): array
    {
        $hijri = $this->hijri->hijriDate($localDate, $user->hijri_offset);
        $times = $this->timesFor($user, $localDate);

        $routines = Routine::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->whereDate('starts_on', '<=', $localDate->toDateString())
            ->where(fn ($q) => $q->whereNull('ends_on')->orWhereDate('ends_on', '>=', $localDate->toDateString()))
            ->orderBy('id')
            ->get();

        $instances = TaskInstance::query()
            ->where('user_id', $user->id)
            ->whereDate('due_date', $localDate->toDateString())
            ->get()
            ->keyBy('routine_id');

        $items = $routines
            ->filter(function (Routine $routine) use ($localDate, $hijri) {
                $rule = $routine->recurrence;
                if (($rule['freq'] ?? null) === 'interval') {
                    $rule['starts_on'] = $routine->starts_on->toDateString();
                }

                return $this->recurrence->matches($rule, $localDate, $hijri);
            })
            ->map(function (Routine $routine) use ($localDate, $times, $instances) {
                $dueAt = $this->resolveDueAt($routine, $localDate, $times);
                /** @var TaskInstance|null $instance */
                $instance = $instances->get($routine->id);

                return [
                    'routine_id' => $routine->id,
                    'instance_id' => $instance?->id,
                    'title' => $routine->title,
                    'category' => $routine->category,
                    'time' => $dueAt?->format('H:i'),
                    'bucket' => $this->bucket($dueAt, $times),
                    'status' => $instance->status ?? 'pending',
                    'reminder_enabled' => $routine->reminder_enabled,
                    'nag_mode' => $routine->nag_mode,
                ];
            })
            ->sortBy([['time', 'asc'], ['routine_id', 'asc']])
            ->values();

        return [
            'routines' => $items->all(),
            'todos' => $this->todosDue($user, $localDate)->all(),
            'overdue' => $this->overdueTodos($user, $localDate)->all(),
        ];
    }

    public function resolveDueAt(Routine $routine, CarbonImmutable $localDate, ?PrayerTimes $times): ?CarbonImmutable
    {
        if ($routine->anchor !== null && $times !== null) {
            return $times->{$routine->anchor}->addMinutes($routine->offset_minutes);
        }

        if ($routine->anchor !== null) {
            return null; // anchored but no location — treat as all-day
        }

        if ($routine->fixed_time !== null) {
            return $localDate->setTimeFromTimeString($routine->fixed_time);
        }

        return null;
    }

    private function timesFor(User $user, CarbonImmutable $localDate): ?PrayerTimes
    {
        if ($user->lat === null || $user->lng === null) {
            return null;
        }

        return $this->prayerTimes->times($user, $localDate);
    }

    private function bucket(?CarbonImmutable $dueAt, ?PrayerTimes $times): string
    {
        if ($dueAt === null) {
            return 'anytime';
        }

        if ($times !== null) {
            return match (true) {
                $dueAt->lessThan($times->fajr) => 'pre_fajr',
                $dueAt->lessThan($times->dhuhr) => 'after_fajr',
                $dueAt->lessThan($times->asr) => 'midday',
                $dueAt->lessThan($times->maghrib) => 'after_asr',
                $dueAt->lessThan($times->isha) => 'after_maghrib',
                default => 'after_isha',
            };
        }

        // No location: fall back to fixed clock boundaries.
        $minutes = $dueAt->hour * 60 + $dueAt->minute;

        return match (true) {
            $minutes < 5 * 60 => 'pre_fajr',
            $minutes < 12 * 60 => 'after_fajr',
            $minutes < 15 * 60 + 30 => 'midday',
            $minutes < 18 * 60 => 'after_asr',
            $minutes < 19 * 60 + 30 => 'after_maghrib',
            default => 'after_isha',
        };
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function todosDue(User $user, CarbonImmutable $localDate): Collection
    {
        return Todo::query()
            ->where('user_id', $user->id)
            ->whereNull('parent_id')
            ->whereDate('due_date', $localDate->toDateString())
            ->whereIn('status', ['pending', 'done'])
            ->with('subtasks')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Todo $todo) => $this->todoItem($todo))
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function overdueTodos(User $user, CarbonImmutable $localDate): Collection
    {
        return Todo::query()
            ->where('user_id', $user->id)
            ->whereNull('parent_id')
            ->where('status', 'pending')
            ->whereDate('due_date', '<', $localDate->toDateString())
            ->orderBy('due_date')
            ->limit(self::OVERDUE_CAP)
            ->get()
            ->map(fn (Todo $todo) => $this->todoItem($todo))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function todoItem(Todo $todo): array
    {
        return [
            'todo_id' => $todo->id,
            'title' => $todo->title,
            'priority' => $todo->priority,
            'due_date' => $todo->due_date?->toDateString(),
            'status' => $todo->status,
            'list_id' => $todo->todo_list_id,
            'subtasks' => $todo->relationLoaded('subtasks')
                ? $todo->subtasks->map(fn (Todo $sub) => [
                    'todo_id' => $sub->id,
                    'title' => $sub->title,
                    'status' => $sub->status,
                ])->all()
                : [],
        ];
    }
}
