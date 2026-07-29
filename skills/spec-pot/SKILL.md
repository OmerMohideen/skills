---
name: spec-pot
description: Use when specs (requirements docs, design docs, API contracts, ADRs) exist alongside code and may have drifted - after implementing a change that touches documented behavior, before trusting a spec as ground truth, during PR review when code and spec disagree, or when asked to "sync specs", "check spec drift", or "keep specs and code aligned".
---

# spec-pot

Specs and code drift apart the moment either changes alone. This skill keeps them one thing by treating drift as a bug to detect and fix, not a doc-debt backlog to defer.

## Core principle

Code is ground truth for *what runs*. The spec is ground truth for *what was intended*. Drift is any place they disagree. Every run of this skill ends with either the spec updated to match code, code fixed to match spec, or an explicit flagged conflict - never a silent "noted for later."

## When to use

- Just finished implementing/changing behavior that a spec, design doc, or API contract describes
- About to rely on a spec's description of current behavior (don't trust it - verify first)
- Reviewing a PR that touches documented behavior
- Asked to check/fix spec drift directly

Not for: writing a spec from scratch (that's plain authoring), or repo-structure mapping (see `to-okf`).

## Workflow

### 1. Find the spec surface

Locate docs that make claims about code behavior: `docs/`, `specs/`, `spec/`, README sections describing behavior/API, ADRs (`docs/adr/`), OpenAPI/schema files, inline doc comments that describe contracts rather than implementation.

### 2. Extract checkable claims

Pull out concrete, falsifiable statements from the spec - function signatures, request/response shapes, invariants, error conditions, config options, defaults. Skip prose that's rationale, not a claim about current behavior.

### 3. Diff claims against code

For each claim, find the corresponding code and check it still holds. Sort what you find into gap types - each needs a different fix:

| Gap type | What it looks like |
| --- | --- |
| Wiring/navigation | Feature is built but unreachable - missing route, missing sidebar/menu link |
| Contracts | Field name/shape/header mismatch between spec and actual API |
| Acceptance criteria | Behavior differs from what the spec describes as correct |
| Test coverage | Spec'd behavior has no test verifying it still holds |
| Logic/UX | Missing error handling, edge case, or user-facing detail the spec calls for |

Don't rely on eyeballing alone - use git history to narrow the search. Find the spec doc's last-touched commit (`git log -n 1 --format=%H -- <spec-path>`), then list what changed in the covered code paths since (`git diff --name-only <that-commit>..HEAD -- <code-paths>`). Anything in that list is a drift candidate; anything not covered by the spec at all is worse than a stale line - it means the spec never saw the change.

Static reading isn't enough to close a gap - a wiring/navigation fix must be confirmed reachable (click through, or add the missing route/link) and a contract fix must be confirmed against actual request/response, not just the spec's prose. Reconciling text without checking behavior just relocates the drift.

### 4. Resolve every drift found

Before editing anything, check the fix against the repo's stated architectural rules (CLAUDE.md/AGENTS.md, a constitution doc, or equivalent). If a fix would violate one, flag that first - don't apply it quietly.

For each mismatch, decide which side is authoritative:
- **Code changed on purpose, spec is stale** → update the spec text, don't just note it
- **Code drifted accidentally from an intended contract** → fix the code, or flag it clearly as a behavior change decision for the user
- **Ambiguous** → surface the specific conflicting lines to the user; don't guess silently

### 5. Leave a trail

If the repo has a changelog/ADR convention, record non-trivial spec updates there so future drift-checks (and humans) can see spec history, not just current state. Don't invent this convention if the repo doesn't already have one - check existing docs first.

If the repo keeps one spec doc per feature/PR (e.g. `specs/006-invoice-settings/`), those pile up and none of them answer "how does this module work right now." Don't leave every fixed doc looking equally current - if a canonical/module-level doc exists, fold the resolved delta into it and mark the feature doc historical (same idea as an ADR moving to `superseded`); if no canonical doc exists yet, don't invent one uninvited, just say so. When folding a delta in, leave a short source marker (e.g. `[from: specs/006-invoice-settings]`) so the merge stays traceable back to what introduced it.

## Quick reference

| Situation | Do this |
| --------- | ------- |
| Just changed code behind a documented API | Update spec in the same change, not a follow-up |
| Spec describes a default that code no longer uses | Fix whichever is wrong; never leave both standing |
| Can't tell which side is intended behavior | Ask the user - name the exact lines in conflict |
| No spec exists yet for changed behavior | Out of scope - that's spec authoring, not drift-fixing |

## Common mistakes

- **Treating drift as a TODO** - "spec is out of date, will fix later" defeats the whole point; fix it now or flag it explicitly
- **Trusting the spec's prose over reading the actual code** - specs describe intent, which may be stale; verify against code every time
- **Rewriting the whole doc** - touch only the drifted claims, keep everything else intact
- **Silently picking a side on ambiguous conflicts** - when intent is unclear, ask rather than assume
- **Fixing the doc text but not checking the feature actually works** - a route/nav fix isn't done until it's reachable; a contract fix isn't done until checked against the real request/response
- **Letting per-feature spec docs pile up as equals** - stale ones with no status read as current; fold resolved ones into the canonical doc or mark them historical
