<?php

namespace App\Exports;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;

class FullAccountExport implements FromCollection
{
    public function __construct(
        private readonly User $user,
    ) {}

    /**
     * @return Collection<int, mixed>
     */
    public function collection(): Collection
    {
        $user = $this->user->load([
            'routines',
            'taskInstances',
            'todos',
            'todoLists',
            'goals.goalProgress',
            'salahLogs',
            'fastingLogs',
            'qadaCounters',
            'quranProgress',
            'hifzItems',
            'dhikrSessions',
        ]);

        $data = [
            'exported_at' => CarbonImmutable::now('UTC')->toIso8601String(),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'timezone' => $user->timezone,
                'locale' => $user->locale,
                'geohash' => $user->geohash,
                'lat' => $user->lat,
                'lng' => $user->lng,
                'calc_method' => $user->calc_method,
                'asr_method' => $user->asr_method,
                'high_lat_rule' => $user->high_lat_rule,
                'hijri_offset' => $user->hijri_offset,
            ],
            'routines' => $user->routines->map(static fn ($r) => [
                'id' => $r->id,
                'title' => $r->title,
                'category' => $r->category,
                'recurrence' => $r->recurrence,
                'anchor' => $r->anchor,
                'offset_minutes' => $r->offset_minutes,
                'is_active' => $r->is_active,
                /** @phpstan-ignore ternary.alwaysTrue */
                'starts_on' => $r->starts_on ? $r->starts_on->format('Y-m-d') : null,
                'ends_on' => $r->ends_on ? $r->ends_on->format('Y-m-d') : null,
            ])->toArray(),
            'task_instances' => $user->taskInstances->map(static fn ($t) => [
                'title' => $t->title,
                'due_date' => $t->due_date->toDateString(),
                'status' => $t->status,
                'completed_at' => $t->completed_at?->toIso8601String(),
                'note' => $t->note,
            ])->toArray(),
            'todos' => $user->todos->map(static fn ($t) => [
                'title' => $t->title,
                'priority' => $t->priority,
                'status' => $t->status,
                'due_date' => $t->due_date?->toDateString(),
                'completed_at' => $t->completed_at?->toIso8601String(),
            ])->toArray(),
            'todo_lists' => $user->todoLists->map(static fn ($l) => [
                'name' => $l->name,
                'color' => $l->color,
            ])->toArray(),
            'goals' => $user->goals->map(static fn ($g) => [
                'title' => $g->title,
                'period' => $g->period,
                'period_basis' => $g->period_basis,
                'target_value' => $g->target_value,
                'unit' => $g->unit,
                'progress' => $g->goalProgress->map(static fn ($p) => [
                    'period_key' => $p->period_key,
                    'current_value' => $p->current_value,
                ])->toArray(),
            ])->toArray(),
            'salah_logs' => $user->salahLogs->map(static fn ($l) => [
                'date' => $l->date->toDateString(),
                'prayer' => $l->prayer,
                'status' => $l->status,
            ])->toArray(),
            'fasting_logs' => $user->fastingLogs->map(static fn ($f) => [
                'date' => $f->date->toDateString(),
                'type' => $f->type,
                'status' => $f->status,
            ])->toArray(),
            'qada_counters' => $user->qadaCounters->map(static fn ($c) => [
                'kind' => $c->kind,
                'owed' => $c->owed,
                'repaid' => $c->repaid,
            ])->toArray(),
            'quran_progress' => $user->quranProgress->map(static fn ($q) => [
                'date' => $q->date->toDateString(),
                'pages_read' => $q->pages_read,
                'from_ref' => $q->from_ref,
                'to_ref' => $q->to_ref,
            ])->toArray(),
            'hifz_items' => $user->hifzItems->map(static fn ($h) => [
                'ref_start' => $h->ref_start,
                'ref_end' => $h->ref_end,
                'status' => $h->status,
                'next_review_on' => $h->next_review_on ? $h->next_review_on->toDateString() : null,
            ])->toArray(),
            'dhikr_sessions' => $user->dhikrSessions->map(static fn ($d) => [
                'slug' => $d->slug,
                'count' => $d->count,
                'target' => $d->target,
                'date' => $d->date->toDateString(),
            ])->toArray(),
        ];

        return new Collection([$data]);
    }
}
