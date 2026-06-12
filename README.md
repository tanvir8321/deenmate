<div align="center">

# 🕌 DeenMate

### Your virtual Muslim self — a free, open-source daily deen assistant

*It knows your routine. It builds your day. It reminds you at the right time — anchored to prayer times, aware of the Hijri calendar.*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Laravel 13](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tests](https://github.com/OWNER/deenmate/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/deenmate/actions)
[![Donate](https://img.shields.io/badge/Donate-Sadaqah_Jariyah-2ea44f)](#-support-the-project-sadaqah-jariyah)

**Free forever · No ads · No trackers · No data selling · Self-hostable**

</div>

---

## Why DeenMate?

Todo apps don't know what Fajr is. Prayer apps don't manage your life. DeenMate is both: a personal assistant built around how a practicing Muslim's day actually works.

- ⏰ **Prayer-anchored reminders** — "Morning adhkar at Fajr + 15 min", recalculated every day for your location. Not fixed clock times.
- 🌙 **Hijri-aware recurrence** — Ayyam al-Beedh fasts (13–15th), Ramadan mode, your zakat anniversary: tasks that follow the Islamic calendar automatically.
- 🔁 **Routines, not todos** — define a habit once (daily, weekly, monthly, yearly — Gregorian or Hijri); your checklist generates itself.
- 🎯 **Goals** — Quran khatm in 60 days (daily quota computed for you), monthly sadaqah targets, yearly hifz plans, with streaks and progress rings.
- ✅ **Todos too** — ad-hoc tasks with lists, priorities, due dates and subtasks live alongside your routine checklist; overdue items surface automatically.
- 📊 **Reports & export** — weekly/monthly (Gregorian *and* Hijri) and yearly reports on your dashboard, with one-click CSV, Excel, and PDF export of all your data.
- 📿 **Deen modules** — salah log with jamaat tracking, morning/evening adhkar (with cited sources), tasbih counter, Quran & hifz tracker with spaced repetition, fasting & qada counters, zakat reminder + calculator.
- 🤝 **Accountability circles** — optional private groups with privacy-first sharing (streaks only by default).
- 🌍 **Multilingual** — English, বাংলা, العربية (RTL), اردو, Türkçe, Bahasa Indonesia.
- 📱 **PWA** — installable on your phone, push notifications, offline today-view.

## Screenshots

> _Coming with v1.0 — see [PLAN.md](PLAN.md) for the build roadmap._

## Quick Start (development)

**Requirements:** PHP 8.3+, Composer, MySQL 8.0+, Redis 7, Node 20+ with pnpm.

```bash
git clone https://github.com/OWNER/deenmate.git
cd deenmate
composer install && pnpm install
cp .env.example .env && php artisan key:generate
# configure DB_* (MySQL) and REDIS_* in .env
php artisan migrate --seed        # seeds default routine packs + adhkar content
php artisan webpush:vapid         # generate push notification keys
composer dev                      # server + queue worker + vite, all at once
```

Visit `http://localhost:8000`, register, and the onboarding flow will build your routine.

## Self-Hosting (production)

One command with Docker:

```bash
cp .env.example .env   # set APP_URL, DB credentials, VAPID keys
docker compose up -d
```

The compose stack includes the app (FrankenPHP/Octane), MySQL, Redis, and Caddy with automatic HTTPS. Full guide: [SELF_HOSTING.md](SELF_HOSTING.md).

Prefer not to self-host? Use the free hosted instance — same code, same zero-tracking policy.

## Our Pledge

1. **Free forever.** Every feature, for every user. Donations change nothing functionally.
2. **No ads. No trackers. No data selling.** The code is public — audit it yourself.
3. **Cited religious content.** Every dua and dhikr carries its source reference; corrections go through reviewed PRs.
4. **Respecting fiqh diversity.** Calculation methods, Asr madhab, and Hijri offset are your settings, not our opinions. For rulings, consult your scholars.

## 💚 Support the Project (Sadaqah Jariyah)

DeenMate is built and run on donations. Every prayer logged, every dhikr counted, every fast this tool helps someone keep — supporters share in that ongoing reward, insha'Allah.

- **GitHub Sponsors** — [github.com/sponsors/OWNER](https://github.com/sponsors/OWNER)
- **Open Collective** — transparent public budget: [opencollective.com/deenmate](https://opencollective.com/deenmate)
- **One-time donation** — Stripe link on our [Donate page](https://example.org/donate)
- **Bangladesh** — bKash / Nagad details on the Donate page

Hosting costs and spending are published openly on Open Collective.

## Contributing

All contributions are welcome — code, translations, documentation, and religious-content review.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 🌐 **Translations are the perfect first contribution** — see the `lang/` guide
- 🕌 **Religious content corrections** require a cited source (book + reference) and pass a second review
- 🐛 Bugs & ideas → [GitHub Issues](https://github.com/OWNER/deenmate/issues); look for `good first issue`
- 🔒 Security issues → see [SECURITY.md](SECURITY.md) (please don't open public issues)

Developers: start with [PLAN.md](PLAN.md) (architecture + roadmap) and [CLAUDE.md](CLAUDE.md) (code conventions — also used by AI coding agents).

## Tech Stack

Laravel 13 · Inertia.js v2 · React 19 · Tailwind CSS v4 · MySQL 8 · Redis + Horizon · Web Push (VAPID) · PWA · Pest · Docker (FrankenPHP)

## License

[AGPL-3.0](LICENSE) — free to use, study, modify, and self-host. If you run a modified version as a service, you must share your changes. This keeps DeenMate free for the ummah, forever.

---

<div align="center">

*"The most beloved of deeds to Allah are those that are most consistent, even if small."* — Sahih al-Bukhari 6464

Made with ❤️ for the ummah · Maintained by [TelliCode](https://tellicode.com)

</div>
