<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ZakatController extends Controller
{
    public function index(): Response
    {
        return inertia('Zakat/Index');
    }

    public function calculate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gold_value' => 'nullable|numeric|min:0',
            'silver_value' => 'nullable|numeric|min:0',
            'cash' => 'nullable|numeric|min:0',
            'liabilities' => 'nullable|numeric|min:0',
        ]);

        $goldValue = (float) ($validated['gold_value'] ?? 0);
        $silverValue = (float) ($validated['silver_value'] ?? 0);
        $cash = (float) ($validated['cash'] ?? 0);
        $liabilities = (float) ($validated['liabilities'] ?? 0);

        $totalAssets = $goldValue + $silverValue + $cash;
        $netAssets = $totalAssets - $liabilities;

        $nisabThreshold = 6000;
        $assetsAboveNisab = max(0, $netAssets - $nisabThreshold);
        $zakatOwed = $assetsAboveNisab * 0.025;

        return redirect()->back()->withInput()->with('result', [
            'total_assets' => round($totalAssets, 2),
            'liabilities' => round($liabilities, 2),
            'net_assets' => round($netAssets, 2),
            'nisab_threshold' => round($nisabThreshold, 2),
            'nisab_source' => 'fixed',
            'assets_above_nisab' => round($assetsAboveNisab, 2),
            'zakat_owed' => round($zakatOwed, 2),
        ]);
    }
}
