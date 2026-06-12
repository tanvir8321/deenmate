<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Notifications\TaskReminderNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): Response
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = $request->user();

        PushSubscription::query()
            ->where('subscribable_id', $user->id)
            ->where('subscribable_type', $user::class)
            ->where('endpoint', $request->input('endpoint'))
            ->delete();

        $user->pushSubscriptions()->create([
            'endpoint' => $request->input('endpoint'),
            'public_key' => $request->input('keys.p256dh'),
            'auth_token' => $request->input('keys.auth'),
            'content_encoding' => 'aesgcm',
        ]);

        Log::info('Push subscription created', ['user_id' => $user->id]);

        return response()->noContent();
    }

    public function destroy(Request $request): Response
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $deleted = PushSubscription::query()
            ->where('subscribable_id', $request->user()->id)
            ->where('subscribable_type', $request->user()::class)
            ->where('endpoint', $request->input('endpoint'))
            ->delete();

        if (! $deleted) {
            throw new NotFoundHttpException;
        }

        Log::info('Push subscription deleted', ['user_id' => $request->user()->id]);

        return response()->noContent();
    }

    public function test(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->pushSubscriptions()->count() === 0) {
            return response()->json(['error' => 'No subscription found.'], 422);
        }

        $user->notify(new TaskReminderNotification(
            title: __('app.test_notification'),
            nagCount: 0,
        ));

        return response()->json(['ok' => true]);
    }
}
