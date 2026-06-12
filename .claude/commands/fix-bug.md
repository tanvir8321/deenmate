---
description: Reproduce, fix, and regression-test a bug
---

# Fix Bug: $ARGUMENTS

Follow this discipline strictly:

1. **Reproduce first.** Locate the relevant code. Write a failing Pest test that demonstrates the bug BEFORE changing any implementation code. If you cannot write a failing test, explain why and ask before proceeding.
2. **Diagnose.** Identify the root cause — not just the symptom. If the bug involves dates, check for timezone handling violations (CLAUDE.md: UTC storage, user TZ only at edges). If it involves recurrence or prayer times, the fix almost certainly belongs inside RecurrenceEngine / PrayerTimeService / HijriCalendarService — not at the call site.
3. **Fix minimally.** Smallest change that makes the failing test pass without breaking others. No drive-by refactors in the same commit.
4. **Guard.** Keep the regression test. Add edge-case tests around the fix (month boundaries, Hijri 29/30-day months, DST transitions) if relevant.
5. **Verify.** `php artisan test` (full suite), `./vendor/bin/pint`, `./vendor/bin/phpstan analyse`.
6. **Commit** with `fix:` message that names the root cause, e.g. `fix: clamp day_of_month rules to month length in RecurrenceEngine`.
