---
description: Scaffold and implement a new feature as a complete vertical slice (migration → model → action → controller → page → tests → i18n)
---

# New Feature: $ARGUMENTS

Implement the feature described above as a **complete vertical slice**, following CLAUDE.md conventions and the patterns already in this codebase. Work in this exact order:

## 1. Plan first (do not skip)
- Restate the feature in 2–3 sentences. Identify which existing module it belongs to (salah / adhkar / quran / fasting / finance / general / goals / circles) or whether it's a new module.
- Check PLAN.md §4 (schema) and §6 (core mechanics) — does this feature touch routines, the TodayResolver, recurrence, reminders, or goals? If yes, list which services are involved. NEVER duplicate logic that belongs in PrayerTimeService, HijriCalendarService, RecurrenceEngine, or TodayResolver.
- List the files you will create/modify before writing any code.

## 2. Database (if needed)
- One migration per table change: `php artisan make:migration ...`
- Follow PLAN.md §4 column conventions: UTC timestamps, `json` columns for rules/payloads, composite indexes for (user_id, date) access patterns, unique constraints to keep Actions idempotent.

## 3. Domain layer
- Model with casts, relationships, and `$fillable`.
- Business logic as an invokable class in `app/Actions/` (e.g. `App\Actions\RecordFast`). One Action = one use case. Idempotent (upsert on unique keys).
- Shared/calculated logic in an existing Service if it fits; create a new Service only for a genuinely new domain concept.

## 4. HTTP layer
- Thin controller: validate via FormRequest, call the Action, return Inertia response or redirect with flash.
- Register routes in the appropriate group (auth middleware).
- Shape props with explicit arrays/Resources — never pass raw models with hidden surprises.

## 5. Frontend
- Page in `resources/js/Pages/<Module>/`, shared pieces in `Components/`.
- Reuse existing components (TaskCard, GoalRing, HijriBadge, PrayerTimesBar) before creating new ones.
- Optimistic UI for state changes with rollback on error.
- Every string through i18n. Add keys to `lang/en/` AND `lang/bn/` (use English placeholder + TODO comment if no Bangla translation yet). If the UI is touched, verify layout in `ar` (RTL).

## 6. Cache & side effects
- If the feature affects what appears in today's checklist: bust the `today:{user_id}:{date}` cache in the Action.
- If it affects goal progress: wire the metric into GoalProgressService.
- If it needs reminders: integrate with the existing reminder precompute — do not build a parallel notification path.

## 7. Tests (required, not optional)
- Pest unit test for every new Action/Service method.
- Feature test for every new endpoint (happy path + validation failure + authorization).
- If dates/timezones are involved: test with Asia/Dhaka, Europe/London, America/New_York.
- If Hijri logic is involved: test with hijri adjustment offsets −1, 0, +1.

## 8. Finish
- Run: `php artisan test`, `./vendor/bin/pint`, `./vendor/bin/phpstan analyse`, `pnpm lint`.
- Fix everything before reporting done.
- Summarize: files changed, how to manually verify, any follow-up TODOs.
- Commit with a conventional `feat:` message.
