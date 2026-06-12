# Changelog

All notable changes to DeenMate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-06-12

### Added

- **Phase 1 — Auth & Profile:** user registration, login, email verification, password reset; profile editing with timezone, locale, prayer calculation preferences, and Hijri offset.
- **Phase 2 — Community Core:** prayer time calculation via `PrayerTimeService`; Hijri conversion via `HijriCalendarService`; daily salah logging with streaks; dhikr sessions and tasbih counter.
- **Phase 3 — Quran & Fasting:** daily Quran pages log; Khatm goal wizard; Hifz tracker with spaced repetition; fasting logging (Ramadan, Mon/Thu, Ayyam al-Beedh) with qada counter; Zakat calculator and anniversary reminder.
- **Phase 4 — Routines & Today View:** Gregorian and Hijri recurrence engine; prayer-time-anchored routines; `TodayResolver` building daily checklist; task complete/skip/undo with optimistic UI; routine CRUD.
- **Phase 5 — Todos & Goals:** ad-hoc todos with lists, priorities, subtasks, due dates, and drag-to-reorder; daily/monthly/yearly goals with progress rings; dashboard stats via `DashboardStatsService`.
- **Phase 6 — Reminders & Sharing:** WebPush notifications; morning briefing; nag mode and quiet hours; circles for shared accountability; reports with CSV/XLSX/PDF export.
- **Phase 7 — Hardening & Launch:** rate limiting (API 60/min, auth 5/min, web 120/min); security headers (CSP, HSTS, frame options, permissions policy); GDPR-compliant `deenmate:export-data` Artisan command; queue failure alerting; version set to 1.0.0.
- Adhkar content (morning/evening/sleep) in `database/content/` with Arabic, transliteration, translation, and sourced citations.
- PWA support with offline capability.
- i18n support: English (en), Bangla (bn), Arabic (ar), Urdu (ur), Turkish (tr), Indonesian (id). RTL layout support.
- Self-hosted Plausible analytics (config flag, default off).
- Docker production deployment with FrankenPHP/Octane.
