<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
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
            'timezone' => ['required', 'timezone:all'],
            'locale' => ['required', Rule::in(['en', 'bn', 'ar', 'ur', 'tr', 'id'])],
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
            'calc_method' => ['required', Rule::in(['mwl', 'isna', 'egypt', 'karachi', 'umm_al_qura', 'tehran', 'gulf', 'moonsighting'])],
            'asr_method' => ['required', Rule::in(['standard', 'hanafi'])],
            'high_lat_rule' => ['required', Rule::in(['none', 'middle_of_night', 'one_seventh', 'angle_based'])],
            'hijri_offset' => ['required', 'integer', 'between:-2,2'],
            'quiet_start' => ['nullable', 'date_format:H:i'],
            'quiet_end' => ['nullable', 'date_format:H:i', 'required_with:quiet_start'],
        ];
    }
}
