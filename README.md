# DeenMate — Your Virtual Muslim Self

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/tanvir8321/deenmate)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)
[![PHP](https://img.shields.io/badge/php-8.3-777bb4)](https://php.net)
[![Laravel](https://img.shields.io/badge/laravel-13-f9322c)](https://laravel.com)

**Free, open-source (AGPL-3.0), donation-funded.** No paywalls. No ads. No trackers. No data selling — ever.

> **Free forever, donation funded.** Every feature unlocked. No premium tier. Your worship data belongs to you.

A web app that acts as a "virtual copy" of a practicing Muslim — generating daily checklists from recurring routines (Gregorian AND Hijri), anchoring reminders to prayer times, and tracking goals like Quran khatm, sunnah fasting, and sadaqah.

## Features

- **Salah tracking** — 5 daily prayers with jamaat/alone/qada/missed status, streaks
- **Adhkar checklists** — Arabic + transliteration + translation, sourced citations
- **Tasbih counter** — full-screen tap, haptics, presets (33/33/34, 100)
- **Quran** — daily pages log, Khatm goal wizard, Hifz tracker with spaced repetition
- **Fasting** — Mon/Thu, Ayyam al-Beedh, Ramadan mode, qada counter
- **Zakat** — anniversary reminder + calculator
- **Routines** — Gregorian AND Hijri recurrence, anchored to prayer times
- **Goals** — daily/monthly/yearly, progress rings on dashboard
- **Todos** — separate from routines, with lists, priorities, subtasks, due dates
- **Reports & Export** — CSV/XLSX/PDF, date-range filters, queued for large exports
- **Reminders** — WebPush, nag mode, quiet hours, morning briefing
- **PWA** — installable, offline-capable

## Screenshots

> Screenshots coming soon. Once the UI is finalized, this section will feature the dashboard, salah tracker, and routine builder.

## Stack

- Laravel 13 (PHP 8.3), Inertia.js v2, React 19, Tailwind CSS v4, Vite, pnpm
- MySQL 8.0+, Redis 7 (cache + queues via Horizon)
- Pest (tests), Laravel Pint (format), PHPStan level 6, ESLint + Prettier

## Quick Start

### Local (no Docker)

```bash
git clone https://github.com/tanvir8321/deenmate.git
cd deenmate
composer install
pnpm install
cp .env.example .env          # edit DB_CONNECTION if no MySQL
php artisan key:generate
php artisan migrate
php artisan serve              # Terminal 1 — http://localhost:8000
pnpm run dev                   # Terminal 2 — Vite HMR
```

### Docker

```bash
docker compose -f docker/compose.yml up -d
```

Visit `http://localhost:8000`. Register, land on dashboard.

## Development

```bash
# Run all checks
php artisan test               # Pest suite
./vendor/bin/pint              # PHP formatting
./vendor/bin/phpstan analyse   # Static analysis (level 6)
pnpm lint && pnpm format        # JS/JSX linting

# Full dev stack (4 terminals)
php artisan serve              # Laravel dev server
php artisan queue:listen       # Queue worker
php artisan pail               # Log viewer
pnpm run dev                   # Vite HMR
```

## Architecture

- Controllers thin — business logic in `app/Actions/` and `app/Services/`
- Dates UTC everywhere — user timezone applied at presentation only
- Single sources of truth:
  - `PrayerTimeService` — all prayer time calculation
  - `HijriCalendarService` — all Hijri conversion
  - `RecurrenceEngine` — all recurrence matching
  - `TodayResolver` — builds daily checklist from routines
- Religious content only in `database/content/` JSON (cited sources)
- RTL works — test with `ar` locale

## Self-Hosting

See `docker/` for production Dockerfile (FrankenPHP/Octane), compose.yml, and Caddyfile. One-command `docker compose up` on a clean VPS.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Religious content changes require cited source + second reviewer. Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `content:`).

## License

AGPL-3.0 — see `LICENSE`. For maximum permissiveness, MIT is the alternative.

## Funding

Sadaqah jariyah — every user's worship assisted by this tool carries ongoing reward for supporters.

- GitHub Sponsors
- Open Collective
- Stripe one-time
- bKash/Nagad (Bangladesh)

See `.github/FUNDING.yml` for links.