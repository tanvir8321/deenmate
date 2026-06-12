---
description: Add or correct religious content (dua, dhikr, adhkar) with required source citation
---

# Add/Correct Religious Content: $ARGUMENTS

Religious content has stricter rules than code (see CLAUDE.md):

1. Content lives ONLY in `database/content/*.json`. Never hardcode dua/dhikr text in components, seeders' PHP strings, or migrations.
2. Required fields for every entry: `id`, `arabic`, `transliteration`, `translations` (at minimum `en` and `bn`), `count` (if repeated), and `source` with `book` and `reference` (e.g. {"book": "Sahih Muslim", "reference": "2723"}). An entry without a verifiable citation must NOT be added — stop and ask the user for the source instead of guessing.
3. Do not compose, paraphrase, or "improve" Arabic text. Copy it exactly as provided by the user or the cited source. If the Arabic provided looks inconsistent with the citation, flag it instead of silently changing it.
4. Bump the `version` field of the JSON file and add a line to its `changelog` array describing the change.
5. Verify the UI renders the Arabic correctly (RTL, Amiri font class) on the relevant adhkar page.
6. Commit with `content:` prefix and include the citation in the commit body.
