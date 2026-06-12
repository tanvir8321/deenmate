<?php

namespace Tests\Unit\Actions;

use App\Actions\RecomputeQadaCounters;
use App\Models\FastingLog;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecomputeQadaCountersTest extends TestCase
{
    use RefreshDatabase;

    public function test_owed_equals_count_of_missed_salah(): void
    {
        $user = User::factory()->create();
        $user->salahLogs()->create(['date' => '2026-06-01', 'prayer' => 'fajr', 'status' => 'missed']);
        $user->salahLogs()->create(['date' => '2026-06-02', 'prayer' => 'fajr', 'status' => 'missed']);
        $user->salahLogs()->create(['date' => '2026-06-01', 'prayer' => 'dhuhr', 'status' => 'missed']);
        $user->salahLogs()->create(['date' => '2026-06-01', 'prayer' => 'asr', 'status' => 'jamaat']);

        $result = app(RecomputeQadaCounters::class)($user, CarbonImmutable::parse('2026-06-13'));

        $byKind = collect($result['rows'])->keyBy('kind');
        $this->assertSame(2, $byKind['salah_fajr']['owed']);
        $this->assertSame(1, $byKind['salah_dhuhr']['owed']);
        $this->assertSame(0, $byKind['salah_asr']['owed']);
    }

    public function test_broken_fasts_become_fast_qada(): void
    {
        $user = User::factory()->create();
        FastingLog::create(['user_id' => $user->id, 'date' => '2026-06-01', 'type' => 'ramadan', 'status' => 'broken']);
        FastingLog::create(['user_id' => $user->id, 'date' => '2026-06-02', 'type' => 'ramadan', 'status' => 'broken']);
        FastingLog::create(['user_id' => $user->id, 'date' => '2026-06-03', 'type' => 'ramadan', 'status' => 'completed']);

        $result = app(RecomputeQadaCounters::class)($user, CarbonImmutable::parse('2026-06-13'));

        $byKind = collect($result['rows'])->keyBy('kind');
        $this->assertSame(2, $byKind['fast']['owed']);
    }

    public function test_idempotent(): void
    {
        $user = User::factory()->create();
        $user->salahLogs()->create(['date' => '2026-06-01', 'prayer' => 'fajr', 'status' => 'missed']);

        $action = app(RecomputeQadaCounters::class);
        $first = $action($user, CarbonImmutable::parse('2026-06-13'));
        $second = $action($user, CarbonImmutable::parse('2026-06-13'));

        $this->assertSame(
            collect($first['rows'])->keyBy('kind')->toArray(),
            collect($second['rows'])->keyBy('kind')->toArray(),
        );
    }

    public function test_repaid_preserved_across_runs(): void
    {
        $user = User::factory()->create();
        $user->qadaCounters()->create(['kind' => 'salah_fajr', 'owed' => 0, 'repaid' => 3]);
        $user->salahLogs()->create(['date' => '2026-06-01', 'prayer' => 'fajr', 'status' => 'missed']);

        app(RecomputeQadaCounters::class)($user, CarbonImmutable::parse('2026-06-13'));

        $counter = $user->qadaCounters()->where('kind', 'salah_fajr')->first();
        $this->assertSame(1, $counter->owed);
        $this->assertSame(3, $counter->repaid);
    }

    public function test_no_logs_creates_zero_owed_rows(): void
    {
        $user = User::factory()->create();

        $result = app(RecomputeQadaCounters::class)($user, CarbonImmutable::parse('2026-06-13'));

        $this->assertSame(6, $result['updated']);
        foreach ($result['rows'] as $row) {
            $this->assertSame(0, $row['owed']);
        }
    }
}
