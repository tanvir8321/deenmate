<?php

namespace App\Exports;

use App\Models\QuranProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * @implements WithMapping<QuranProgress>
 */
class QuranProgressExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private readonly User $user,
        private readonly ?string $dateFrom = null,
        private readonly ?string $dateTo = null,
    ) {}

    /**
     * @return Collection<int, QuranProgress>
     */
    public function collection(): Collection
    {
        $query = $this->user->quranProgress()->orderBy('date', 'asc');

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
            'Pages Read',
            'From (Surah:Ayah)',
            'To (Surah:Ayah)',
        ];
    }

    /**
     * @param  QuranProgress  $progress
     * @return array<int, string|null>
     */
    public function map($progress): array
    {
        return [
            $progress->date->toDateString(),
            (string) $progress->pages_read,
            $progress->from_ref,
            $progress->to_ref,
        ];
    }
}
