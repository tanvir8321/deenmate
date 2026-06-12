# DeenMate (Open Source) — Build Plan for Claude Code
# Your Virtual Muslim Self · Laravel 13 + Inertia v2 + React 19
# License: AGPL-3.0 · Free forever · Donation-funded (sadaqah jariyah)
# Last updated: June 2026

> **HOW TO USE THIS FILE WITH CLAUDE CODE**
> 1. Create an empty repo, place this file at the root as `PLAN.md`.
> 2. Copy §2 (Conventions) into `CLAUDE.md` at the repo root — Claude Code reads it automatically every session.
> 3. Work phase by phase: tell Claude Code "Implement Phase 1 from PLAN.md. Follow CLAUDE.md conventions. Run tests before finishing."
> 4. Each phase lists explicit tasks with acceptance criteria. Do not skip phases; later phases depend on earlier ones.

---

## §1 — Project Overview

**What it is:** A personal assistant web app that acts as a "virtual copy" of a practicing Muslim. It generates the user's daily checklist from recurring routines (daily/weekly/monthly/yearly, on BOTH Gregorian and Hijri calendars), anchors reminders to prayer times (e.g., "morning adhkar at Fajr + 15 min"), and tracks goals (daily/monthly/yearly) like Quran khatm, sunnah fasting, and sadaqah.

**What it is NOT:** Not a paid SaaS. No paywalls, no ads, no trackers, no data selling — ever. All features free for all users. Funded by donations. Code is public; anyone may self-host.

**Core modules:** Salah tracking · Adhkar checklists · Tasbih counter · Quran (tilawat quota + khatm goals + hifz with spaced repetition) · Fasting (Ramadan mode, Mon/Thu, Ayyam al-Beedh, qada counter) · Zakat anniversary reminder + calculator · **Todos** (ad-hoc tasks & lists with priorities and subtasks, alongside the routine-generated checklist) · Goals engine · **Reports & Export** (dashboard widgets, monthly/yearly report pages, CSV/XLSX/PDF export) · Streaks/heatmap · Accountability circles · Donations page.

**Hosted instance** (app.deenmate.org or similar) + **self-hosting** (Docker) are both first-class.

---

## §2 — Conventions (copy this section into CLAUDE.md)

### Stack
- Laravel 13 (PHP 8.3), Inertia.js v2, React 19, Tailwind CSS v4, Vite
- MySQL 8.0+, Redis 7 (cache + queues via Horizon)
- Pest for tests, Laravel Pint for formatting, PHPStan (larastan) level 6
- pnpm for JS packages. ESLint + Prettier for JS/JSX.

### Code rules
- Controllers are thin. Business logic lives in `app/Actions/` (single-purpose invokable classes) and `app/Services/`.
- All dates stored UTC. User timezone applied only at presentation/anchor-resolution time. Never use `now()` without explicit timezone reasoning.
- Hijri date logic ONLY through `App\Services\HijriCalendarService` — never inline conversion.
- Prayer time logic ONLY through `App\Services\PrayerTimeService`.
- Recurrence matching ONLY through `App\Services\RecurrenceEngine`.
- Every Action and Service gets a Pest unit test. Every endpoint gets a feature test.
- Eloquent: no queries in Blade/JSX-bound props beyond what controllers pass. Use API Resources / Inertia props shaped in controllers.
- Frontend: function components + hooks only. Pages in `resources/js/Pages`, shared UI in `resources/js/Components`. No class components. Tailwind utility classes; extract repeated patterns into components, not @apply.
- i18n: every user-facing string goes through translation helpers (`__()` server-side, `useTranslation` hook client-side). Languages: en (base), bn, ar (RTL), ur, tr, id. RTL must work — test with ar locale.
- Accessibility: all interactive elements keyboard-accessible, aria labels on icon buttons.
- Religious content (dua/adhkar texts) lives in versioned JSON under `database/content/` with source citation fields (book, number). Never hardcode dua text in components.
- Commits: conventional commits (feat:, fix:, docs:, test:, refactor:).
- NEVER add analytics SDKs, ad code, or third-party trackers. Self-hosted Plausible only, behind config flag, off by default.

### Commands
```bash
composer dev          # runs server, queue, vite concurrently (Laravel 13 default)
php artisan test      # Pest
./vendor/bin/pint     # format PHP
./vendor/bin/phpstan analyse
pnpm lint && pnpm format
```

### Definition of Done (every phase)
- [ ] All listed acceptance criteria pass
- [ ] Pest tests written and green
- [ ] Pint + PHPStan + ESLint clean
- [ ] Works in `en` and one RTL locale where UI is touched
- [ ] No new dependencies without justification in the PR description

---

## §3 — Repository Layout

```
deenmate/
├── CLAUDE.md                  # conventions (from §2)
├── PLAN.md                    # this file
├── README.md                  # project intro, screenshots, quickstart
├── LICENSE                    # AGPL-3.0
├── CONTRIBUTING.md            # how to contribute, content-review policy
├── CODE_OF_CONDUCT.md
├── SECURITY.md                # vulnerability reporting
├── .github/
│   ├── workflows/ci.yml       # tests, pint, phpstan, eslint on PR
│   ├── ISSUE_TEMPLATE/ (bug, feature, content-correction)
│   └── FUNDING.yml            # GitHub Sponsors + Open Collective links
├── docker/                    # self-hosting: Dockerfile, compose.yml, Caddyfile
├── app/
│   ├── Actions/               # CompleteTask, GenerateUserDay, RecordDhikr...
│   ├── Exports/               # MonthlyReportExport, SalahLogExport... (Laravel Excel)
│   ├── Services/              # PrayerTimeService, HijriCalendarService,
│   │                          # RecurrenceEngine, TodayResolver, GoalProgressService
│   ├── Models/
│   ├── Http/Controllers/
│   ├── Notifications/         # TaskReminder, MorningBriefing (webpush+mail)
│   └── Console/Commands/
├── database/
│   ├── migrations/
│   ├── seeders/               # DefaultRoutinePackSeeder, DemoUserSeeder
│   └── content/               # adhkar.json, duas.json, surah_meta.json (cited)
├── resources/js/
│   ├── Pages/                 # Dashboard, Routines, Todos, Goals, Quran, Salah,
│   │                          # Fasting, Reports, Circles, Settings, Donate
│   ├── Components/            # PrayerTimesBar, TaskCard, TasbihCounter,
│   │                          # StreakHeatmap, GoalRing, HijriBadge
│   └── hooks/
└── tests/ (Feature/, Unit/)
```

---

## §4 — Database Schema (authoritative)

Claude Code: create one migration per table, in this order.

```
users
  id, name, email, password, timezone (string, IANA), locale (default 'en'),
  geohash (char(6), nullable), lat, lng (decimal, nullable),
  calc_method (enum: mwl|isna|egypt|karachi|umm_al_qura|tehran|gulf|moonsighting, default karachi),
  asr_method (enum: standard|hanafi, default hanafi),
  high_lat_rule (enum: none|middle_of_night|one_seventh|angle_based, default none),
  quiet_start (time, nullable), quiet_end (time, nullable),
  onboarded_at, timestamps

routines
  id, user_id FK, title, category (enum: salah|adhkar|quran|fasting|finance|general),
  recurrence JSON,            -- see §5 rule format
  anchor (enum nullable: fajr|sunrise|dhuhr|asr|maghrib|isha),
  offset_minutes (int, default 0),
  fixed_time (time, nullable), -- used when anchor is null
  reminder_enabled (bool), nag_mode (bool, default false),
  starts_on (date), ends_on (date nullable), is_active (bool),
  source_template_id (FK nullable → routine_templates), timestamps
  INDEX (user_id, is_active)

task_instances                 -- MATERIALIZED ONLY ON INTERACTION (see §6)
  id, user_id FK, routine_id FK nullable, title,
  due_date (date), due_at (datetime UTC nullable),
  status (enum: done|skipped|missed), completed_at, note, timestamps
  UNIQUE (user_id, routine_id, due_date)
  INDEX (user_id, due_date)
  -- MySQL note: no partitioning in v1 (MySQL forbids FKs on partitioned tables).
  -- The composite index (user_id, due_date) carries the load. Add an
  -- `instances:archive` command (Phase 7) that moves rows older than 2 years
  -- to task_instances_archive if the table ever grows uncomfortable.

todo_lists
  id, user_id, name, color (nullable), sort_order, timestamps

todos                          -- ad-hoc tasks, separate from routine instances
  id, user_id, todo_list_id FK nullable, parent_id FK nullable (subtasks, max 1 level),
  title, description (text nullable),
  priority (enum: low|normal|high|urgent, default normal),
  due_date (date nullable), due_at (datetime UTC nullable),
  status (enum: pending|done|cancelled), completed_at, sort_order, timestamps
  INDEX (user_id, status, due_date)

goals
  id, user_id, title, period (daily|monthly|yearly),
  period_basis (gregorian|hijri), target_value (int), unit (count|pages|amount|days),
  metric_source (enum: routine_completions|salah_jamaat|quran_pages|fasts|manual),
  linked_routine_ids JSON nullable, starts_on, ends_on nullable, timestamps

goal_progress
  id, goal_id FK, period_key (string, e.g. '2026-06' or 'H1447-12' or '2026-06-12'),
  current_value (int), UNIQUE (goal_id, period_key), timestamps

salah_logs
  id, user_id, date, prayer (fajr|dhuhr|asr|maghrib|isha),
  status (jamaat|alone|qada|missed), UNIQUE (user_id, date, prayer)

dhikr_sessions
  id, user_id, slug (e.g. 'post_salah_tasbih'), count, target, date, timestamps

fasting_logs
  id, user_id, date, type (ramadan|monday_thursday|ayyam_beedh|qada|nafl|arafah|ashura),
  status (completed|broken|intended), timestamps

qada_counters
  id, user_id, kind (fast|salah_fajr|...|salah_isha), owed (int), repaid (int)

quran_progress
  id, user_id, date, pages_read (int), from_ref, to_ref (string, surah:ayah)

hifz_items
  id, user_id, ref_start, ref_end, status (learning|review),
  ease (smallint), next_review_on (date), interval_days (int)   -- SM-2-lite

routine_templates              -- public library
  id, author_id nullable, title, description, locale, category,
  payload JSON (array of routine definitions), verified (bool),
  install_count (int), published (bool), timestamps

circles / circle_members
  circles: id, name, owner_id, invite_code (unique), timestamps
  circle_members: circle_id, user_id, share_level (streak_only|percent|full), UNIQUE pair

push_subscriptions             -- from laravel-notification-channels/webpush

prayer_times_cache
  id, date, geohash (char(6)), method, asr_method, high_lat_rule,
  times JSON, UNIQUE (date, geohash, method, asr_method, high_lat_rule)

donations                      -- record of donations (no card data stored)
  id, user_id nullable, provider (github|opencollective|stripe|bkash|manual),
  amount, currency, external_id, donated_at
```

---

## §5 — Recurrence Rule Format (JSON on routines.recurrence)

```jsonc
{ "freq": "daily" }
{ "freq": "weekly", "days": ["mon","thu"] }
{ "freq": "monthly", "day_of_month": 1 }
{ "freq": "yearly", "month": 6, "day": 12 }
{ "freq": "hijri_monthly", "hijri_days": [13,14,15] }
{ "freq": "hijri_yearly", "hijri_month": 9 }                    // all of Ramadan
{ "freq": "hijri_yearly", "hijri_month": 12, "hijri_day": 9 }   // Arafah
{ "freq": "interval", "every_days": 3 }                          // every N days from starts_on
```

`RecurrenceEngine::matches(array $rule, CarbonImmutable $date, HijriDate $hijri): bool`
must be a pure function. Test matrix in `tests/Unit/RecurrenceEngineTest.php` must cover every freq type, month-end edge cases (day_of_month=31 in February → clamp to last day), and Hijri month length variance (29/30).

---

## §6 — Core Mechanics (read before implementing Phases 2–4)

### TodayResolver (virtual instances)
`TodayResolver::for(User $user, CarbonImmutable $localDate): Collection`
1. Load user's active routines (cached).
2. Filter via RecurrenceEngine against $localDate (Gregorian + Hijri).
3. Resolve each routine's time: anchor → PrayerTimeService lookup + offset; else fixed_time; else all-day.
4. Merge materialized `task_instances` rows for that date (status overrides) + todos due that date. Overdue pending todos surface in a separate "Overdue" bucket at the top (capped at 10, link to full Todos page).
5. Cache result in Redis: key `today:{user_id}:{date}`, TTL until local midnight. Bust on routine change or interaction.

A `task_instances` row is INSERTED only when the user acts (done/skip) — upsert on the unique key.

### Day rollover & missed marking
Hourly command `day:rollover` finds timezones that just passed local midnight (chunked user query per tz), then for each user: marks yesterday's uncompleted *reminder-enabled* virtual items as `missed` (materializing them), updates streaks and goal_progress, busts caches, and precomputes today's reminder schedule.

### Reminder pipeline
- During rollover, resolve all of today's reminder times to concrete UTC timestamps → write to Redis sorted set `reminders:{yyyy-mm-dd-hh}` (score = unix ts).
- `reminders:dispatch` runs every minute: ZRANGEBYSCORE current minute → queue `SendTaskReminder` jobs (high-priority queue) → WebPush + optional mail. Dedupe key per (user, routine, date). Nag mode: re-enqueue +30 min until materialized as done/skipped, max 4 nags, respects quiet hours.

### PrayerTimeService
- Pure-PHP calculation (port standard PrayTimes algorithms or use `islamic-network/libraries` equivalents; vendor the math — no runtime third-party API).
- Cache by (date, geohash6, method, asr_method, high_lat_rule).
- `times(User $u, CarbonImmutable $date): PrayerTimes` value object with typed getters.

### HijriCalendarService
- Umm al-Qura tabular conversion + per-user adjustment offset (−2…+2 days, in settings) since moonsighting varies by country.
- `toHijri(date)`, `hijriMonthLength(y,m)`, `isRamadan(date, user)`, `event(date): ?string`.

---

## §7 — Build Phases (Claude Code task lists)

### Phase 0 — Scaffold & Tooling
Tasks:
1. `laravel new` (Laravel 13) with Pest; install Inertia v2 + React 19 + Tailwind v4 via official adapters; pnpm.
2. Install: horizon, laravel-notification-channels/webpush, larastan, pint config.
3. Auth: Laravel Fortify (or starter kit) — register/login/forgot/verify, profile page.
4. CI workflow: pint, phpstan, pest, eslint on PR. Docker dev compose (mysql, redis, mailpit).
5. Create CLAUDE.md (§2), README skeleton, LICENSE (AGPL-3.0), CONTRIBUTING.md, SECURITY.md, FUNDING.yml.
Acceptance: fresh clone → `composer dev` → register → empty dashboard renders via Inertia. CI green.

### Phase 1 — Foundations: Prayer Times + Hijri + Settings
Tasks:
1. HijriCalendarService + unit tests (known conversion fixtures, adjustment offset).
2. PrayerTimeService (all 8 methods, both Asr, 3 high-lat rules) + prayer_times_cache + tests against published Dhaka/London/Jakarta fixtures (±2 min tolerance).
3. Settings page: location (browser geolocation → geohash, manual city fallback), method, madhab, locale, hijri offset, quiet hours.
4. PrayerTimesBar component: today's 6 times, next-prayer countdown, Hijri+Gregorian date badge.
Acceptance: user in Dhaka sees correct Karachi-method Hanafi times; switching to London/ISNA recalculates; Hijri date matches AlAdhan ±offset.

### Phase 2 — Recurrence Engine + Today Checklist (the heart)
Tasks:
1. Migrations: routines, task_instances (with composite index per §4), todo_lists, todos.
2. RecurrenceEngine (pure, fully tested per §5 matrix).
3. TodayResolver per §6 with Redis caching.
4. Actions: CompleteTask, SkipTask, UndoTask (materialize/upsert, bust cache).
5. Routines CRUD pages (list/create/edit) with a friendly rule builder UI (no raw JSON for users).
6. **Todos module**: My Todos page (lists sidebar, priority badges, drag sort, subtasks, due dates), quick-add input on the dashboard ("+ todo" with natural due date picker), Actions: CreateTodo, CompleteTodo, etc. Todos with a due date appear in the Today view; a "Convert to routine" action turns a repeating todo into a proper routine.
7. Dashboard Today view: two clear sections — **Routine checklist** (items grouped by time-of-day buckets: pre-Fajr / after Fajr / midday / after Asr / after Maghrib / after Isha / anytime) and **Todos** (due today + overdue bucket) — tap to complete with optimistic UI.
8. `day:rollover` command per §6 + streak computation (current/longest per routine and global).
Acceptance: create "Surah Mulk daily isha+30" → appears today at correct local time; complete → persists row; Hijri rule [13,14,15] appears only on those Hijri dates (test with adjustment); rollover marks missed and updates streaks; a todo due today shows in the Todos section and an overdue one shows in the Overdue bucket; completing a subtask doesn't complete the parent. Feature tests cover all.

### Phase 3 — Reminders & PWA
Tasks:
1. Web push: VAPID keys, subscription flow UI, test-notification button.
2. Reminder precompute + minute dispatcher + nag mode + quiet hours per §6.
3. MorningBriefing notification at Fajr+30 (today count, Hijri date, next prayer).
4. PWA: manifest, service worker (vite-plugin-pwa), offline cache of today view, install prompt.
Acceptance: reminder fires within 60s of target; nag repeats until done (max 4); briefing respects locale; app installable on Android Chrome, offline shows cached today list.

### Phase 4 — Deen Modules
Tasks:
1. Salah log (5 daily check-ins with jamaat/alone/qada/missed) + Jumu'ah Friday checklist + salah streaks.
2. Adhkar: seed `database/content/adhkar.json` (morning/evening/post-salah, Arabic + transliteration + bn/en translation + source citation). Checklist UI with Arabic typography (Amiri/Scheherazade font), RTL correct.
3. TasbihCounter page: full-screen tap, haptics, presets (33/33/34, 100), saves dhikr_sessions.
4. Quran: daily pages log; Khatm goal wizard ("finish in N days" → computes daily quota, creates linked routine + goal); progress page.
5. Hifz tracker with SM-2-lite review scheduling (next_review_on; reviews appear as today items).
6. Fasting: Mon/Thu + Ayyam al-Beedh routines from library; fasting_logs; qada counter; **Ramadan mode** — auto banner + suhoor/iftar countdown + tarawih item when HijriCalendarService::isRamadan.
7. Zakat: anniversary (Hijri yearly routine) + simple calculator page (assets input, nisab from manually-entered gold/silver rate; clearly labeled "consult a scholar").
Acceptance: each module has feature tests; Arabic renders RTL correctly; Ramadan mode activates on Hijri 9 (test with offset).

### Phase 5 — Goals, Reports & Export, Circles, Library
Tasks:
1. Goals engine: CRUD, metric_source wiring, goal_progress updated by rollover + interactions; GoalRing components on dashboard.
2. **Dashboard reporting widgets** (top of dashboard, beneath PrayerTimesBar): "This week" summary card (completion %, salah jamaat count, Quran pages, current streak), GoalRing row, and a 90-day mini StreakHeatmap. All widgets read from a `DashboardStatsService` with per-user daily cache — never raw queries in the controller.
3. **Reports module** (`Pages/Reports/`): Weekly, Monthly (Gregorian AND Hijri month), and Yearly views — completion % trend chart, salah breakdown (jamaat/alone/qada/missed), Quran pages + khatm progress, fasting summary, todos completed, streak records, full-year StreakHeatmap. Charts via a lightweight chart component (recharts).
4. **Export system**:
   - CSV + XLSX via `maatwebsite/excel`: export classes in `app/Exports/` for salah logs, completed instances, todos, Quran progress, fasting logs, dhikr sessions — date-range filterable.
   - PDF via `barryvdh/laravel-dompdf`: beautifully formatted Monthly Report PDF (Blade template, supports Bangla + Arabic fonts) — "Download report" button on every report page.
   - Full account export (JSON, GDPR-style) — UI button wired to the artisan export from Phase 7.
   - Exports are queued jobs for large ranges (> 1000 rows) with a notification + download link when ready; small exports stream immediately.
5. Routine template library: browse/install curated packs; seeders for "Daily Essentials", "Ramadan Pack", "Sunnah Fasting", "Hifz Juz Amma", "New Muslim Starter". Install = copy payload into user routines.
6. Circles: create/join via invite code, share_level privacy options, daily circle board (completion % only by default).
Acceptance: installing a pack creates routines that appear correctly; goal progress matches manual count in tests; dashboard widgets match report-page numbers exactly (same service); monthly PDF renders Bangla and Arabic text correctly; XLSX export opens clean in Excel with typed columns; large export queues and notifies; circle never leaks item details at streak_only level.

### Phase 6 — Open Source & Donation Infrastructure
Tasks:
1. Donate page (in-app + public site): GitHub Sponsors, Open Collective, one-time Stripe Payment Link, bKash/Nagad details for Bangladesh; transparent "what donations fund" section. No feature gating anywhere — donating changes nothing functionally (optional supporter badge on profile, off by default).
2. donations table + webhook endpoints (Stripe, Open Collective) to record + thank-you email.
3. Self-hosting: production Dockerfile (FrankenPHP/Octane), compose.yml (app, mysql, redis, caddy), `.env.example`, one-command `docker compose up`, SELF_HOSTING.md with VAPID/key generation steps.
4. Public landing page (Inertia route, no auth): mission, privacy pledge, screenshots, "Use hosted free" + "Self-host" + "Donate" + "Contribute".
5. i18n pass: extract all strings; complete bn + ar translations; locale switcher; RTL audit.
6. Docs: finalize README (badges, screenshots, quickstart), CONTRIBUTING (PR flow, content-correction process requiring source citation, translation guide), GitHub issue templates, demo seeder.
Acceptance: `docker compose up` on a clean VPS serves a working instance; donation webhooks record rows; landing page lighthouse ≥ 90; bn and ar fully usable.

### Phase 7 — Hardening & Launch
Tasks:
1. Rate limiting, audit auth flows, security headers, dependency audit; load-test TodayResolver + dispatcher (k6 script, target: 10K concurrent users on 1 vCPU×2 app nodes).
2. Sentry (config-flag, default off for self-hosters), Laravel Pulse, queue alerting.
3. Backup strategy doc + artisan export command (user data → JSON, GDPR-style).
4. Versioned release v1.0.0, changelog, GitHub Release with Docker image (GHCR).
Acceptance: CI publishes image on tag; load test passes; export produces complete user archive.

---

## §8 — Open Source Strategy

- **License: AGPL-3.0.** Anyone can use, self-host, and modify freely; anyone running a modified hosted version must share their changes. This protects the project from a closed-source commercial fork (e.g., someone rebranding it with ads) while keeping it 100% free. (If maximum permissiveness matters more to you than fork-protection, MIT is the alternative — decide before first public commit.)
- **Governance:** you (TelliCode) as maintainer; CONTRIBUTING.md defines review rules. Religious content changes require a cited source (hadith reference, scholarly work) and a second reviewer.
- **Funding channels:** GitHub Sponsors + Open Collective (transparent budget — strong trust signal) + Stripe one-time link + bKash/Nagad for BD donors. Frame: *sadaqah jariyah — every user's worship assisted by this tool carries ongoing reward for its supporters.* Publish hosting costs openly; community funds the hosted instance.
- **Community building:** launch on GitHub + r/islam, MuslimTechNetwork, BD dev communities; "good first issue" labels (translations are perfect first contributions); pre-Ramadan 1448 (~Feb 2027) is the launch moment.
- **Trust levers:** open code = auditable privacy; no trackers by default; scholar-cited content; public Open Collective ledger.

---

## §9 — Suggested Claude Code Session Prompts

```
Session 1: "Read PLAN.md and CLAUDE.md. Implement Phase 0 completely. Verify CI passes."
Session 2: "Implement Phase 1. Write the fixture tests for PrayerTimeService first (TDD), then the service."
Session 3: "Implement Phase 2 tasks 1–4 (engine + resolver + actions) with full unit coverage, no UI yet."
Session 4: "Implement Phase 2 tasks 5–7 (UI + rollover). Use the existing actions."
... continue one phase (or half-phase) per session. After each: "Run the full test suite and pint/phpstan; fix anything failing."
```

Keep sessions scoped — one phase or sub-phase at a time produces better results than "build the whole app."
