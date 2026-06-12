# CLAUDE.md — DeenMate Project Conventions

This file is read by Claude Code at the start of every session. Follow it strictly.
The full build plan with phases, schema, and acceptance criteria lives in `PLAN.md` — read the relevant phase before implementing anything.

## Project

DeenMate is a free, open-source (AGPL-3.0), donation-funded web app: a "virtual copy" of a practicing Muslim. It generates a daily checklist from recurring routines (Gregorian AND Hijri recurrence), anchors reminders to prayer times, and tracks daily/monthly/yearly goals. No paywalls, no ads, no trackers, no data selling — ever. Do not add any of these.

## Stack

- Laravel 13 (PHP 8.3), Inertia.js v2, React 19, Tailwind CSS v4, Vite, pnpm
- **MySQL 8.0+** (use `json` columns for rule/payload fields; no table partitioning — MySQL forbids FKs on partitioned tables; rely on composite indexes)
- Redis 7 — cache + queues (Laravel Horizon)
- Pest (tests), Laravel Pint (format), Larastan/PHPStan level 6, ESLint + Prettier

## Commands

```bash
composer dev                    # server + queue + vite concurrently
php artisan test                # Pest suite
./vendor/bin/pint               # PHP formatting
./vendor/bin/phpstan analyse    # static analysis
pnpm lint && pnpm format        # JS/JSX
```

Run tests, pint, and phpstan before declaring any task complete.

## Architecture rules

- **Thin controllers.** Business logic lives in `app/Actions/` (single-purpose invokable classes) and `app/Services/`. Controllers shape Inertia props and call Actions.
- **Single sources of truth — never bypass these services:**
  - `App\Services\PrayerTimeService` — ALL prayer time calculation (pure PHP, cached by date+geohash+method; no runtime third-party API calls).
  - `App\Services\HijriCalendarService` — ALL Hijri conversion/events (Umm al-Qura tables + per-user adjustment offset).
  - `App\Services\RecurrenceEngine` — ALL recurrence matching. `matches(array $rule, CarbonImmutable $date, HijriDate $hijri): bool` must stay a pure function.
  - `App\Services\TodayResolver` — builds a user's day from routines (virtual instances). `task_instances` rows are written ONLY on user interaction (done/skip) or when marking missed at rollover — never pre-generate.
- **Dates:** store UTC everywhere. Apply the user's IANA timezone only at presentation and anchor-resolution time. Never call `now()` without explicit timezone reasoning. Use `CarbonImmutable`.
- **Todos vs routines are separate concepts.** Routines generate the recurring checklist via TodayResolver; `todos` are ad-hoc one-time tasks (with lists, priorities, subtasks). Never write todos into `task_instances` or vice versa. Todos with a due date are merged into the Today view by TodayResolver; overdue pending todos appear in the Overdue bucket.
- **Reports & exports:** all dashboard/report numbers come from `App\Services\DashboardStatsService` (cached per user per day) — never raw aggregate queries in controllers, so dashboard widgets and report pages can never disagree. Export classes live in `app/Exports/` (CSV/XLSX via maatwebsite/excel; PDF via barryvdh/laravel-dompdf Blade templates with Bangla/Arabic font support). Exports over ~1000 rows run as queued jobs delivering a download link; smaller ones stream directly.
- **Queues:** reminder jobs go on the `high` queue; everything else on `default`. All jobs idempotent with dedupe keys.

## Frontend rules

- Function components + hooks only. Pages in `resources/js/Pages/`, shared UI in `resources/js/Components/`, hooks in `resources/js/hooks/`.
- Tailwind utility classes; extract repeats into components, not `@apply`.
- Optimistic UI for task complete/skip with rollback on failure.
- Every user-facing string through i18n (`__()` server-side, `useTranslation` client-side). Base locale `en`; `bn`, `ar`, `ur`, `tr`, `id` supported. **RTL must work** — when touching UI, verify in `ar`.
- Accessibility: keyboard-operable interactions, `aria-label` on icon-only buttons.

## Religious content rules

- Dua/adhkar/surah text lives ONLY in versioned JSON under `database/content/` with fields: arabic, transliteration, translations, `source` (book + reference number). Never hardcode religious text in components or migrations.
- Changes to religious content require a cited source in the PR description.
- Fiqh-sensitive features (Asr method, high-latitude rules, Hijri offset) are user settings — never hardcode one madhab's position as the only behavior.

## Testing rules

- Every Action and Service gets a Pest unit test; every endpoint gets a feature test.
- `RecurrenceEngine` must keep its full test matrix green: every freq type, month-end clamping (day 31 → Feb), Hijri 29/30-day month variance.
- `PrayerTimeService` is tested against published fixtures (Dhaka/Karachi-Hanafi, London/ISNA, Jakarta/MWL) with ±2 minute tolerance.
- Timezone-sensitive logic is tested with at least Asia/Dhaka, Europe/London, and America/New_York.

## Privacy & security rules

- NEVER add analytics SDKs, ad code, or third-party trackers. Self-hosted Plausible only, behind a config flag, default off.
- Store location as geohash(6) + lat/lng only; never log raw location.
- No card data touches our DB — donation providers handle payment; we store provider + amount + external_id only.
- New dependencies require justification in the PR description.

## Adding a new feature (vertical-slice recipe)

Every feature, now and in the future, is built as a complete vertical slice in this order. The `/new-feature` slash command automates this checklist — prefer it.

1. **Plan:** restate the feature; identify its module; list files to create/modify; check whether it touches routines/TodayResolver/recurrence/reminders/goals — if so, integrate with the existing services, never duplicate their logic.
2. **Migration(s):** one per table change; UTC timestamps; `json` for rules/payloads; composite `(user_id, date)` indexes; unique constraints so Actions stay idempotent.
3. **Domain:** Model (casts, relations) + invokable Action in `app/Actions/` (one Action = one use case, idempotent upserts).
4. **HTTP:** FormRequest validation → thin controller → Action → Inertia response.
5. **Frontend:** Page under `Pages/<Module>/`; reuse existing Components first; optimistic UI; all strings through i18n (`en` + `bn` keys minimum).
6. **Side effects:** bust `today:{user_id}:{date}` cache if today's checklist changes; wire GoalProgressService if goals are affected; reuse the existing reminder pipeline — never a parallel notification path.
7. **Tests:** unit test per Action/Service; feature test per endpoint (happy + validation + auth); timezone tests (Asia/Dhaka, Europe/London, America/New_York) when dates are involved; Hijri offset tests (−1/0/+1) when Hijri is involved.
8. **Finish:** full test suite + pint + phpstan + eslint green, then a conventional `feat:` commit.

New domain concepts get a new Service only when no existing Service fits. When in doubt, extend — don't fork.

## Claude Code configuration (.claude/)

- `.claude/settings.json` (committed, team-shared): pre-approves all routine project commands (composer, artisan make/migrate/test, pint, phpstan, pest, pnpm, git add/commit, docker compose) so work proceeds without permission prompts. Destructive operations stay gated: `ask` for git push/merge, rm, migrate:fresh/rollback, db:wipe, composer update/remove; `deny` for rm -rf, sudo, force-push, hard reset, and reading/editing `.env` (secrets stay out of context).
- Hooks: PHP files are auto-formatted with Pint after every Edit/Write; a Stop hook reminds about the Definition of Done.
- `.claude/commands/`: `/new-feature <description>`, `/fix-bug <description>`, `/add-deen-content <description>` — use these instead of ad-hoc prompts; they encode this file's recipes.
- Personal overrides go in `.claude/settings.local.json` (gitignored) — never loosen the deny list in the shared file.

## Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `content:` (religious content).
- One PLAN.md phase (or sub-phase) per session. Do not skip ahead; later phases depend on earlier acceptance criteria.
- Definition of Done for every task: acceptance criteria in PLAN.md pass · tests green · pint/phpstan/eslint clean · touched UI verified in `en` + one RTL locale.
