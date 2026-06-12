<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'todo_list_id' => [
                'nullable',
                Rule::exists('todo_lists', 'id')->where('user_id', $userId),
            ],
            'parent_id' => [
                'nullable',
                Rule::exists('todos', 'id')->where('user_id', $userId)->whereNull('parent_id'),
            ],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
