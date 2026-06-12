<?php

namespace Database\Factories;

use App\Models\Routine;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Routine>
 */
class RoutineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'category' => 'general',
            'recurrence' => ['freq' => 'daily'],
            'anchor' => null,
            'offset_minutes' => 0,
            'fixed_time' => null,
            'reminder_enabled' => false,
            'nag_mode' => false,
            'starts_on' => '2026-01-01',
            'ends_on' => null,
            'is_active' => true,
        ];
    }

    public function anchored(string $anchor, int $offset = 0): static
    {
        return $this->state(['anchor' => $anchor, 'offset_minutes' => $offset]);
    }

    public function withReminder(): static
    {
        return $this->state(['reminder_enabled' => true]);
    }
}
