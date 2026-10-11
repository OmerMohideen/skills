# Static prefilter (suspects only)

~60s source sweep before spinning up a browser. Every hit below is a **suspect**, not a finding — it saves scan/fix time by pointing at likely trouble. The Playwright + axe scan is the only verdict and overrules every suspect here.

## Suspect checks

- `img` without `alt` → suspect `image-alt` (serious). Decorative images still need `alt=""`.
- `button` without accessible name (no text, no `aria-label`) → suspect `button-name` (critical).
- `input`/`select`/`textarea` without associated `label` → suspect `label` (critical). NOTE: the scan may split this across `label`, `select-name`, `input-button-name` — fix per reported class.
- `<html>` without `lang` → suspect `html-has-lang` (serious); no `<title>` → suspect `document-title` (serious).
- Skipped heading levels (`h1` → `h3`) or missing `h1` → suspect `heading-order` / `page-has-heading-one` (moderate). NOTE: these two carry only `best-practice` tags, so the default tag set can never confirm them — dropped here means unverified, not clean (see the opt-in second pass in `modes.md`).

## Rules

- Record suspects, change nothing on suspicion alone.
- Single-line regexes false-fire on multiline attributes — read the element before recording a suspect.
- A suspect the scan does not confirm is dropped, not fixed.
- The word "suspect" stays attached to every prefilter hit until the scan speaks.
