<?php

use App\Http\Controllers\AdhkarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DhikrSessionController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\FastingController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\HifzController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\QuranController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoutineController;
use App\Http\Controllers\SalahController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TaskInstanceController;
use App\Http\Controllers\TermsController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\TodoListController;
use App\Http\Controllers\ZakatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');

Route::get('/privacy', PrivacyController::class)->name('privacy.policy');
Route::get('/terms', TermsController::class)->name('terms.ofuse');

Route::get('/donate', [DonationController::class, 'index'])->name('donate');
Route::post('/donate/webhook', [DonationController::class, 'webhook'])->name('donate.webhook');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/salah', [SalahController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('salah.index');
Route::post('/salah', [SalahController::class, 'store'])
    ->middleware(['auth', 'verified'])->name('salah.store');
Route::post('/salah/repay-qada', [SalahController::class, 'repayQada'])
    ->middleware(['auth', 'verified'])->name('salah.repay-qada');

Route::get('/zakat', [ZakatController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('zakat.index');
Route::post('/zakat/calculate', [ZakatController::class, 'calculate'])
    ->middleware(['auth', 'verified'])->name('zakat.calculate');

Route::get('/hifz', [HifzController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('hifz.index');
Route::post('/hifz', [HifzController::class, 'store'])
    ->middleware(['auth', 'verified'])->name('hifz.store');
Route::post('/hifz/review', [HifzController::class, 'review'])
    ->middleware(['auth', 'verified'])->name('hifz.review');

Route::get('/adhkar', [AdhkarController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('adhkar.index');
Route::get('/library', [LibraryController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('library.index');

Route::get('/quran', [QuranController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('quran.index');
Route::post('/quran', [QuranController::class, 'store'])
    ->middleware(['auth', 'verified'])->name('quran.store');

Route::get('/fasting', [FastingController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('fasting.index');
Route::post('/fasting', [FastingController::class, 'store'])
    ->middleware(['auth', 'verified'])->name('fasting.store');

Route::get('/tasbih', fn () => Inertia::render('Tasbih/Index'))
    ->middleware(['auth', 'verified'])->name('tasbih.index');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');

    Route::resource('routines', RoutineController::class)->except('show');

    Route::resource('goals', GoalController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::post('/tasks/complete', [TaskInstanceController::class, 'complete'])->name('tasks.complete');
    Route::post('/tasks/skip', [TaskInstanceController::class, 'skip'])->name('tasks.skip');
    Route::post('/tasks/undo', [TaskInstanceController::class, 'undo'])->name('tasks.undo');

    Route::resource('todos', TodoController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('/todos/reorder', [TodoController::class, 'reorder'])->name('todos.reorder');
    Route::post('/todos/{todo}/complete', [TodoController::class, 'complete'])->name('todos.complete');
    Route::post('/todos/{todo}/reopen', [TodoController::class, 'reopen'])->name('todos.reopen');
    Route::post('/todos/{todo}/convert', [TodoController::class, 'convert'])->name('todos.convert');

    Route::post('/todo-lists', [TodoListController::class, 'store'])->name('todo-lists.store');
    Route::patch('/todo-lists/{todoList}', [TodoListController::class, 'update'])->name('todo-lists.update');
    Route::delete('/todo-lists/{todoList}', [TodoListController::class, 'destroy'])->name('todo-lists.destroy');

    Route::post('/push-subscription', [PushSubscriptionController::class, 'store'])->name('push-subscription.store');
    Route::delete('/push-subscription', [PushSubscriptionController::class, 'destroy'])->name('push-subscription.destroy');
    Route::post('/push-subscription/test', [PushSubscriptionController::class, 'test'])->name('push-subscription.test');

    Route::post('/dhikr-sessions', [DhikrSessionController::class, 'store'])->name('dhikr-sessions.store');
    Route::delete('/dhikr-sessions/{id}', [DhikrSessionController::class, 'destroy'])->name('dhikr-sessions.destroy');

    Route::get('/reports', fn () => Inertia::render('Reports/Index'))
        ->middleware(['verified'])->name('reports.index');
    Route::get('/reports/data', [ReportController::class, 'index'])
        ->middleware(['verified'])->name('reports.data');

    Route::get('/export/salah', [ExportController::class, 'exportSalah'])
        ->middleware(['verified'])->name('export.salah');
    Route::get('/export/tasks', [ExportController::class, 'exportTasks'])
        ->middleware(['verified'])->name('export.tasks');
    Route::get('/export/quran', [ExportController::class, 'exportQuran'])
        ->middleware(['verified'])->name('export.quran');
    Route::get('/export/full', [ExportController::class, 'exportFull'])
        ->middleware(['verified'])->name('export.full');
});

require __DIR__.'/auth.php';
