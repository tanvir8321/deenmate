<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ in_array(app()->getLocale(), ['ar', 'ur']) ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>@lang('reports.monthly_report') — DeenMate</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&family=Inter:wght@400;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', 'Scheherazade New', 'Amiri', sans-serif;
            font-size: 11px;
            line-height: 1.6;
            color: #1f2937;
            padding: 0;
        }

        .page {
            padding: 24px 32px;
        }

        .header {
            text-align: center;
            padding-bottom: 16px;
            border-bottom: 2px solid #059669;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #059669;
            margin-bottom: 4px;
        }

        .header .subtitle {
            font-size: 13px;
            color: #6b7280;
        }

        .header .user-name {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2px;
        }

        .section {
            margin-bottom: 18px;
        }

        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #059669;
            border-bottom: 1px solid #d1fae5;
            padding-bottom: 4px;
            margin-bottom: 10px;
        }

        .grid-4 {
            display: flex;
            gap: 8px;
        }

        .grid-4 > * { flex: 1; }

        .stat-box {
            background: #ecfdf5;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
        }

        .stat-box .value {
            font-size: 20px;
            font-weight: 700;
            color: #059669;
        }

        .stat-box .label {
            font-size: 9px;
            color: #6b7280;
            margin-top: 2px;
        }

        .stat-box.amber { background: #fef3c7; }
        .stat-box.amber .value { color: #d97706; }
        .stat-box.blue { background: #eff6ff; }
        .stat-box.blue .value { color: #2563eb; }
        .stat-box.red { background: #fef2f2; }
        .stat-box.red .value { color: #dc2626; }

        .progress-bar {
            height: 16px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin: 4px 0;
        }

        .progress-fill {
            height: 100%;
            background: #059669;
            border-radius: 4px;
            transition: width 0.3s;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }

        th {
            background: #f0fdf4;
            color: #065f46;
            font-weight: 600;
            padding: 6px 8px;
            text-align: left;
            border-bottom: 1px solid #d1fae5;
        }

        td {
            padding: 4px 8px;
            border-bottom: 1px solid #f3f4f6;
        }

        tr:nth-child(even) td {
            background: #f9fafb;
        }

        .footer {
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            margin-top: 24px;
        }

        .footer .brand {
            font-weight: 600;
            color: #059669;
        }

        .arabic {
            font-family: 'Amiri', 'Scheherazade New', serif;
            font-size: 13px;
        }

        .rtl { direction: rtl; text-align: right; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="user-name">{{ $userName }}</div>
            <h1>@lang('reports.monthly_report')</h1>
            <div class="subtitle">
                {{ $gregorianMonth }} &middot; {{ $hijriMonth }}
            </div>
        </div>

        <div class="section">
            <div class="section-title">@lang('reports.salah_summary')</div>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="value">{{ $stats['salah_breakdown']['jamaat'] ?? 0 }}</div>
                    <div class="label">@lang('reports.jamaat')</div>
                </div>
                <div class="stat-box blue">
                    <div class="value">{{ $stats['salah_breakdown']['alone'] ?? 0 }}</div>
                    <div class="label">@lang('reports.alone')</div>
                </div>
                <div class="stat-box amber">
                    <div class="value">{{ $stats['salah_breakdown']['qada'] ?? 0 }}</div>
                    <div class="label">@lang('reports.qada')</div>
                </div>
                <div class="stat-box red">
                    <div class="value">{{ $stats['salah_breakdown']['missed'] ?? 0 }}</div>
                    <div class="label">@lang('reports.missed')</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">@lang('reports.overview_stats')</div>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="value">{{ $stats['quran_pages'] ?? 0 }}</div>
                    <div class="label">@lang('reports.quran_pages')</div>
                </div>
                <div class="stat-box amber">
                    <div class="value">{{ $stats['fasting_completed'] ?? 0 }}</div>
                    <div class="label">@lang('reports.fasts_completed')</div>
                </div>
                <div class="stat-box blue">
                    <div class="value">{{ $stats['todos_completed'] ?? 0 }}</div>
                    <div class="label">@lang('reports.todos_completed')</div>
                </div>
                <div class="stat-box" style="background: #f5f3ff;">
                    <div class="value" style="color: #7c3aed;">{{ $stats['current_streak'] ?? 0 }}</div>
                    <div class="label">@lang('reports.current_streak')</div>
                </div>
            </div>
        </div>

        @if (!empty($goals))
        <div class="section">
            <div class="section-title">@lang('Goals')</div>
            @foreach ($goals as $goal)
                @php $pct = $goal['target'] > 0 ? min(round(($goal['current'] / $goal['target']) * 100), 100) : 0; @endphp
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #4b5563; margin-bottom: 2px;">
                        <span>{{ $goal['title'] }}</span>
                        <span>{{ $goal['current'] }} / {{ $goal['target'] }} {{ $goal['unit'] }}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{ $pct }}%;"></div>
                    </div>
                </div>
            @endforeach
        </div>
        @endif

        <div class="section">
            <div class="section-title">@lang('reports.daily_completion')</div>
            @if (!empty($stats['days']))
            <table>
                <thead>
                    <tr>
                        <th>@lang('reports.date')</th>
                        <th>@lang('reports.done')</th>
                        <th>@lang('reports.completion')</th>
                        <th>@lang('reports.quran_pages')</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (array_slice($stats['days'], 0, 31) as $day)
                    <tr>
                        <td>{{ $day['date'] }}</td>
                        <td>{{ $day['done'] }} / {{ $day['total'] }}</td>
                        <td>
                            <div class="progress-bar" style="height: 12px;">
                                <div class="progress-fill" style="width: {{ $day['completion_pct'] }}%;"></div>
                            </div>
                        </td>
                        <td>{{ $day['quran_pages'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
        </div>

        <div class="footer">
            <span class="brand">@lang('reports.deenmate_branding')</span> &mdash;
            @lang('reports.generated_on') {{ now()->format('Y-m-d H:i') }} UTC
        </div>
    </div>
</body>
</html>
