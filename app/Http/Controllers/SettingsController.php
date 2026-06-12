<?php

namespace App\Http\Controllers;

use App\Actions\UpdateUserSettings;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\User;
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
                'theme' => $user->theme ?? 'deenmate',
                'display_name' => $user->display_name,
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
            'notificationPreferences' => $user->notification_preferences ?? User::defaultNotificationPreferences(),
            'accountInfo' => [
                'email' => $user->email,
                'email_verified_at' => $user->getAttribute('email_verified_at') instanceof \DateTimeInterface ? $user->getAttribute('email_verified_at')->format('c') : null,
                'created_at' => $user->getAttribute('created_at') instanceof \DateTimeInterface ? $user->getAttribute('created_at')->format('c') : null,
            ],
        ]);
    }

    public function update(UpdateSettingsRequest $request, UpdateUserSettings $action): RedirectResponse
    {
        $data = $request->validated();
        $action($request->user(), $data);

        return back()->with('status', 'settings-updated');
    }
}
