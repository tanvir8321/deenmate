<?php

namespace App\Exports;

use App\Models\SalahLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * @implements WithMapping<SalahLog>
 */
class SalahLogExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private readonly User $user,
        private readonly ?string $dateFrom = null,
        private readonly ?string $dateTo = null,
    ) {}

    /**
     * @return Collection<int, SalahLog>
     */
    public function collection(): Collection
    {
        $query = $this->user->salahLogs()->orderBy('date', 'asc')->orderBy('prayer', 'asc');

        if ($this->dateFrom) {
            $query->whereDate('date', '>=', $this->dateFrom);
        }
        if ($this->dateTo) {
            $query->whereDate('date', '<=', $this->dateTo);
        }

        return $query->get();
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'Date',
            'Prayer',
            'Status',
        ];
    }

    /**
     * @param  SalahLog  $log
     * @return array<int, string>
     */
    public function map($log): array
    {
        return [
            $log->date->toDateString(),
            $log->prayer,
            $log->status,
        ];
    }
}
