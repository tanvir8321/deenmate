<?php

namespace Database\Factories;

use App\Models\Routine;
use App\Models\TaskInstance;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskInstance>
 */
class TaskInstanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'routine_id' => Routine::factory(),
            'title' => fake()->sentence(3),
            'due_date' => '2026-06-12',
            'due_at' => null,
            'status' => 'done',
            'completed_at' => now(),
            'note' => null,
        ];
    }
}
