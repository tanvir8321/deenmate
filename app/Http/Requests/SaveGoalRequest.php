<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveGoalRequest extends FormRequest
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
        return [
            'title' => ['required', 'string', 'max:255'],
            'period' => ['required', Rule::in(['daily', 'monthly', 'yearly'])],
            'period_basis' => ['required', Rule::in(['gregorian', 'hijri'])],
            'target_value' => ['required', 'integer', 'min:1'],
            'unit' => ['required', Rule::in(['count', 'pages', 'amount', 'days'])],
            'metric_source' => ['required', Rule::in(['routine_completions', 'salah_jamaat', 'quran_pages', 'fasts', 'manual'])],
            'linked_routine_ids' => [
                'nullable',
                'array',
                Rule::requiredIf(fn () => $this->input('metric_source') === 'routine_completions'),
            ],
            'linked_routine_ids.*' => ['integer', 'exists:routines,id'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
        ];
    }
}
