<?php

namespace App\Http\Controllers;

use App\Exports\FullAccountExport;
use App\Exports\QuranProgressExport;
use App\Exports\SalahLogExport;
use App\Exports\TaskInstanceExport;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportController extends Controller
{
    public function exportSalah(Request $request): Response|BinaryFileResponse
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'format' => 'required|in:csv,xlsx,pdf',
        ]);

        $exporter = new SalahLogExport($request->user(), $validated['date_from'] ?? null, $validated['date_to'] ?? null);

        return $this->download($exporter, 'salah-logs', $validated['format']);
    }

    public function exportTasks(Request $request): Response|BinaryFileResponse
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'format' => 'required|in:csv,xlsx,pdf',
        ]);

        $exporter = new TaskInstanceExport($request->user(), $validated['date_from'] ?? null, $validated['date_to'] ?? null);

        return $this->download($exporter, 'task-instances', $validated['format']);
    }

    public function exportQuran(Request $request): Response|BinaryFileResponse
    {
        $validated = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'format' => 'required|in:csv,xlsx,pdf',
        ]);

        $exporter = new QuranProgressExport($request->user(), $validated['date_from'] ?? null, $validated['date_to'] ?? null);

        return $this->download($exporter, 'quran-progress', $validated['format']);
    }

    public function exportFull(Request $request): Response|BinaryFileResponse
    {
        $validated = $request->validate([
            'format' => 'required|in:json',
        ]);

        $exporter = new FullAccountExport($request->user());

        return $this->download($exporter, 'full-account-export', $validated['format']);
    }

    private function download(object $exporter, string $fileName, string $format): BinaryFileResponse
    {
        $extension = match ($format) {
            'csv' => 'csv',
            'xlsx' => 'xlsx',
            'pdf' => 'pdf',
            'json' => 'json',
            default => 'xlsx',
        };

        $writerType = match ($format) {
            'csv' => Excel::CSV,
            'xlsx' => Excel::XLSX,
            'pdf' => Excel::DOMPDF,
            default => Excel::XLSX,
        };

        $fullName = $fileName.'-'.now()->format('Y-m-d-His').'.'.$extension;

        return \Maatwebsite\Excel\Facades\Excel::download($exporter, $fullName, $writerType);
    }
}
