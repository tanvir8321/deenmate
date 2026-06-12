<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\User;
use App\Notifications\ThankYouNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class DonationController extends Controller
{
    public function index(): Response
    {
        return inertia('Donate/Index');
    }

    public function webhook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:github,opencollective,stripe,bkash,manual',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|size:3|alpha',
            'external_id' => 'nullable|string',
            'donated_at' => 'nullable|date',
            'email' => 'nullable|email',
            'name' => 'nullable|string',
        ]);

        $donation = Donation::create([
            'user_id' => User::query()->where('email', $validated['email'] ?? null)->value('id'),
            'provider' => $validated['provider'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'USD',
            'external_id' => $validated['external_id'] ?? null,
            'donated_at' => $validated['donated_at'] ?? now(),
        ]);

        if ($donation->user) {
            $donation->user->notify(new ThankYouNotification(
                name: $donation->user->name,
                amount: $donation->amount,
                currency: $donation->currency,
            ));
        } elseif ($validated['email'] ?? null) {
            Log::info('Donation recorded for non-user', [
                'email' => $validated['email'],
                'name' => $validated['name'] ?? null,
                'amount' => $donation->amount,
                'currency' => $donation->currency,
                'provider' => $donation->provider,
            ]);
        }

        return response()->json(['status' => 'ok'], 201);
    }
}
