---
name: axe
description: Use when checking or fixing web accessibility with axe-core — a11y scans, WCAG violations, accessible HTML/UI review for changed routes, components, or live URLs.
---

# axe

Check and fix web accessibility with real scan evidence: free `axe-core` (MPL-2.0, no key, no account) driven through Playwright. Static suspects first, Playwright + axe as the only verdict, fix one violation class at a time, re-scan before claiming done.

## When to use

- Asked to "check a11y", "run an axe scan", "fix WCAG violations", "is this accessible?"
- Changed files include HTML, components, routes, styles, or a URL to audit
- Reviewing UI output for accessible names, labels, headings, contrast, ARIA

Not for: backend-only changes with no rendered UI. No MCP, no Deque account flow — local engine only.

## Workflow

### 1. Prefilter (~60s, suspects only, Mode 1 only)

When you have local source, run `references/static-prefilter.md`. Skip this step for live-URL audits (Mode 2) — there is no source to sweep. Record suspects, change nothing. Axe verdict wins over every suspect.

### 2. Scan (source of truth)

Mode 1 (local components/routes) or Mode 2 (live URLs) per `references/modes.md`. Emit JSON: violations + incomplete.

### 3. Triage

Order and discipline per `references/triage.md`: critical → serious → moderate → minor. `incomplete` stays open with an owner and a manual step — never auto-closed.

### 4. Fix → re-scan

One violation class at a time, minimal diff, then re-run the same scan. Done means 0 violations on the scoped surface plus every `incomplete` explicitly dispositioned.

### 5. Report

Files touched, rule IDs + impact, before/after violation counts, remaining manual items. Every fix cites its rule ID — no vague "improved accessibility".

Audit-only runs (no fix): per-viewport violation tables, third-party carve-outs, fixture-page caveats — shapes in `references/triage.md`.

## Guardrails

- Default bar WCAG 2.2 A+AA: `withTags(['wcag2a','wcag2aa','wcag22aa'])` (see `references/modes.md`).
- Scope to changed routes/components by default; full-site crawl is opt-in.
- Color-contrast verdicts need real-browser values — no jsdom verdicts.
- `aria-*` changes must come from axe's `helpUrl`/rule docs, never invented ARIA.

## References

- `references/modes.md` — Mode 1 local scan + Mode 2 live audit patterns
- `references/triage.md` — impact order, incomplete discipline, report shape
- `references/static-prefilter.md` — fast suspect sweep (filter only)
