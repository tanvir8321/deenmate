<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveRoutineRequest extends FormRequest
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
            'category' => ['required', Rule::in(['salah', 'adhkar', 'quran', 'fasting', 'finance', 'general'])],
            'recurrence' => ['required', 'array'],
            'recurrence.freq' => ['required', Rule::in([
                'daily', 'weekly', 'monthly', 'yearly', 'hijri_monthly', 'hijri_yearly', 'interval',
            ])],
            'recurrence.days' => ['required_if:recurrence.freq,weekly', 'array'],
            'recurrence.days.*' => [Rule::in(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])],
            'recurrence.day_of_month' => ['required_if:recurrence.freq,monthly', 'integer', 'between:1,31'],
            'recurrence.month' => ['required_if:recurrence.freq,yearly', 'integer', 'between:1,12'],
            'recurrence.day' => ['required_if:recurrence.freq,yearly', 'integer', 'between:1,31'],
            'recurrence.hijri_days' => ['required_if:recurrence.freq,hijri_monthly', 'array'],
            'recurrence.hijri_days.*' => ['integer', 'between:1,30'],
            'recurrence.hijri_month' => ['required_if:recurrence.freq,hijri_yearly', 'integer', 'between:1,12'],
            'recurrence.hijri_day' => ['nullable', 'integer', 'between:1,30'],
            'recurrence.every_days' => ['required_if:recurrence.freq,interval', 'integer', 'min:1', 'max:365'],
            'anchor' => ['nullable', Rule::in(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'])],
            'offset_minutes' => ['nullable', 'integer', 'between:-180,300'],
            'fixed_time' => ['nullable', 'date_format:H:i', 'prohibited_unless:anchor,null'],
            'reminder_enabled' => ['boolean'],
            'nag_mode' => ['boolean'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'is_active' => ['boolean'],
        ];
    }
}
