<?php

namespace Tests\Feature;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use App\Services\StreakService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolloverTest extends TestCase
{
    use RefreshDatabase;

    public function test_rollover_marks_reminder_enabled_uncompleted_as_missed(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        $reminded = Routine::factory()->for($user)->withReminder()->create(['title' => 'Fajr adhkar']);
        Routine::factory()->for($user)->create(['title' => 'No reminder']); // not reminder-enabled

        $this->artisan('day:rollover', ['--tz' => 'Asia/Dhaka'])->assertSuccessful();

        $yesterday = CarbonImmutable::now('Asia/Dhaka')->subDay()->toDateString();

        $this->assertDatabaseHas('task_instances', [
            'routine_id' => $reminded->id,
            'status' => 'missed',
        ]);
        // Only the reminder-enabled routine was materialized.
        $this->assertSame(1, TaskInstance::query()->where('user_id', $user->id)->count());
        $this->assertSame($yesterday, TaskInstance::query()->first()->due_date->toDateString());
    }

    public function test_rollover_leaves_completed_instances_untouched(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        $routine = Routine::factory()->for($user)->withReminder()->create();

        $yesterday = CarbonImmutable::now('Asia/Dhaka')->subDay()->toDateString();
        TaskInstance::factory()->for($user)->for($routine)->create([
            'due_date' => $yesterday,
            'status' => 'done',
        ]);

        $this->artisan('day:rollover', ['--tz' => 'Asia/Dhaka'])->assertSuccessful();

        $this->assertSame(1, TaskInstance::query()->count());
        $this->assertSame('done', TaskInstance::query()->first()->status);
    }

    public function test_rollover_is_idempotent(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        Routine::factory()->for($user)->withReminder()->create();

        $this->artisan('day:rollover', ['--tz' => 'Asia/Dhaka'])->assertSuccessful();
        $this->artisan('day:rollover', ['--tz' => 'Asia/Dhaka'])->assertSuccessful();

        $this->assertSame(1, TaskInstance::query()->count());
    }

    public function test_streaks_computed_from_done_instances(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        $routine = Routine::factory()->for($user)->create();

        $today = CarbonImmutable::now('Asia/Dhaka')->startOfDay();
        foreach ([0, 1, 2] as $daysAgo) {
            TaskInstance::factory()->for($user)->for($routine)->create([
                'due_date' => $today->subDays($daysAgo)->toDateString(),
                'status' => 'done',
            ]);
        }
        // Gap, then an older 1-day run — longest stays 3.
        TaskInstance::factory()->for($user)->for($routine)->create([
            'due_date' => $today->subDays(5)->toDateString(),
            'status' => 'done',
        ]);

        $streaks = app(StreakService::class)->global($user, $today);

        $this->assertSame(3, $streaks['current']);
        $this->assertSame(3, $streaks['longest']);
    }

    public function test_current_streak_survives_if_today_not_yet_done(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        $routine = Routine::factory()->for($user)->create();

        $today = CarbonImmutable::now('Asia/Dhaka')->startOfDay();
        foreach ([1, 2] as $daysAgo) {
            TaskInstance::factory()->for($user)->for($routine)->create([
                'due_date' => $today->subDays($daysAgo)->toDateString(),
                'status' => 'done',
            ]);
        }

        $streaks = app(StreakService::class)->forRoutine($user, $routine->id, $today);

        $this->assertSame(2, $streaks['current']);
    }

    public function test_broken_streak_resets_current(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Dhaka']);
        $routine = Routine::factory()->for($user)->create();

        $today = CarbonImmutable::now('Asia/Dhaka')->startOfDay();
        TaskInstance::factory()->for($user)->for($routine)->create([
            'due_date' => $today->subDays(3)->toDateString(),
            'status' => 'done',
        ]);

        $streaks = app(StreakService::class)->forRoutine($user, $routine->id, $today);

        $this->assertSame(0, $streaks['current']);
        $this->assertSame(1, $streaks['longest']);
    }
}
