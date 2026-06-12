<?php

namespace App\Exports;

use App\Models\TaskInstance;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * @implements WithMapping<TaskInstance>
 */
class TaskInstanceExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private readonly User $user,
        private readonly ?string $dateFrom = null,
        private readonly ?string $dateTo = null,
    ) {}

    /**
     * @return Collection<int, TaskInstance>
     */
    public function collection(): Collection
    {
        $query = $this->user->taskInstances()
            ->where('status', 'done')
            ->orderBy('due_date', 'asc');

        if ($this->dateFrom) {
            $query->whereDate('due_date', '>=', $this->dateFrom);
        }
        if ($this->dateTo) {
            $query->whereDate('due_date', '<=', $this->dateTo);
        }

        return $query->get();
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'Title',
            'Due Date',
            'Completed At',
            'Note',
        ];
    }

    /**
     * @param  TaskInstance  $instance
     * @return array<int, string|null>
     */
    public function map($instance): array
    {
        return [
            $instance->title,
            $instance->due_date->toDateString(),
            $instance->completed_at?->toDateTimeString(),
            $instance->note,
        ];
    }
}
