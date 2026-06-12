<?php

namespace App\Http\Controllers;

use App\Actions\InstallRoutinePack;
use App\Models\RoutineTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function index(Request $request): Response
    {
        $templates = RoutineTemplate::query()
            ->where('published', true)
            ->orderBy('category')
            ->orderBy('title')
            ->get()
            ->map(fn (RoutineTemplate $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'description' => $t->description,
                'locale' => $t->locale,
                'category' => $t->category,
                'verified' => $t->verified,
                'install_count' => $t->install_count,
            ]);

        return Inertia::render('Library/Index', [
            'templates' => $templates,
        ]);
    }

    public function install(RoutineTemplate $template, InstallRoutinePack $action, Request $request): RedirectResponse
    {
        $action($request->user(), $template);

        return redirect()->route('routines.index')->with('status', 'pack-installed');
    }
}
