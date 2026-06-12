<?php

namespace App\Http\Controllers;

use App\Actions\UpdateUserSettings;
use App\Http\Requests\UpdateSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'settings' => [
                'timezone' => $user->timezone,
                'locale' => $user->locale,
                'lat' => $user->lat,
                'lng' => $user->lng,
                'geohash' => $user->geohash,
                'calc_method' => $user->calc_method,
                'asr_method' => $user->asr_method,
                'high_lat_rule' => $user->high_lat_rule,
                'hijri_offset' => $user->hijri_offset,
                'quiet_start' => $user->quiet_start,
                'quiet_end' => $user->quiet_end,
            ],
        ]);
    }

    public function update(UpdateSettingsRequest $request, UpdateUserSettings $action): RedirectResponse
    {
        $action($request->user(), $request->validated());

        return back()->with('status', 'settings-updated');
    }
}
