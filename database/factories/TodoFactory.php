<?php

namespace Database\Factories;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Todo>
 */
class TodoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'todo_list_id' => null,
            'parent_id' => null,
            'title' => fake()->sentence(3),
            'description' => null,
            'priority' => 'normal',
            'due_date' => null,
            'due_at' => null,
            'status' => 'pending',
            'completed_at' => null,
            'sort_order' => 0,
        ];
    }

    public function dueOn(string $date): static
    {
        return $this->state(['due_date' => $date]);
    }

    public function done(): static
    {
        return $this->state(['status' => 'done', 'completed_at' => now()]);
    }
}
