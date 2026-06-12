<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoutineController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TaskInstanceController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\TodoListController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');

    Route::resource('routines', RoutineController::class)->except('show');

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
});

require __DIR__.'/auth.php';
