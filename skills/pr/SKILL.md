---
name: pr
description: Use when writing a PR body, opening a pull request, or reviewing a change that needs reviewer evidence - especially when UI or visual output changed and before/after screenshots are required.
---

# pr

Write PR bodies reviewers can merge with confidence: visual summary, concrete evidence, explicit merge risk.

## Core principle

Text claims what changed; pictures prove it. Every PR gets a sketch of the change, runnable evidence, and a merge-danger call - frontend changes always ship before/after images.

## When to use

- Opening or rewriting a PR body/description
- Asked to "make this reviewable", "summarize this PR", "post QA results"
- Changed files include UI, routes, components, styles, or screenshots

Not for: visual spec authoring from scratch (write the spec, then return here), or repo-structure mapping.

## Workflow

### 1. Scope the PR

Find base without guessing: `FIRST=$(git rev-list --reverse --topo-order origin/HEAD..HEAD | head -1)` then base is `$FIRST^` if it exists, else `origin/HEAD`. List scope with `git diff --name-only <base>..HEAD`. Frontend = any component, route, style, asset, or Playwright spec changed.

### 2. Write Summary with one visual

Pick the smallest view that makes the point. Place it next to the short text it supports. Keep only the calls, files, props, states, and boundaries the point needs.

- Show logic or an algorithm as pseudocode:

```
on(save)
  if content is unchanged
    return cached result
  write new content
  return fresh result
```

- Show runtime control flow as a call tree:

```
submitForm
  createSession
    persistPrompt
    launchAgent
  navigateToSession
```

- Show UI structure as a component tree, including file paths, state, and module boundaries that matter:

```
<SessionPage> (apps/example/src/routes/session.tsx)
  useSessionEvents()
  <SessionToolbar>
    <RunSkillButton> (packages/ui)
```

- Show file responsibility or a broad refactor as a shallow file tree:

```
src/
├── commands/       # parses user actions
├── sessions/       # owns session state
└── transport/      # sends API requests
```

- Show component interaction, control flow, or data flow with Mermaid:

```
sequenceDiagram
    participant User
    participant UI
    participant Daemon
    User->>UI: choose command
    UI->>Daemon: send expanded prompt
    Daemon-->>UI: stream result
```

- Use `diff` when the point is what changes and the surrounding shape already exists. Match the diff shape to the topic. For a component change:

```
 <SessionPage>
   useSessionEvents()
   <SessionToolbar>
+    <RunSkillButton />
   <SessionTimeline>
+    <SkillResultCard />
```

For a file-layout change:

```
 src/
 ├── commands/
+│   └── show-me.ts       # expands the slash command
 ├── sessions/
-└── transport.ts
+└── transport/
+    ├── client.ts
+    └── stream.ts
```

For a call-tree change:

```
 submitForm
   createSession
     persistPrompt
+    expandSkillMention
     launchAgent
-  navigateToSession
+  navigateToSession
+    subscribeToEvents
```

For a state or control-flow change:

```
 on(save)
-  write content
+  if content is unchanged
+    return cached result
+  write new content
+  invalidate cache
```

- Show the whole block when most of it is new, when omitted context would hide ownership or order, or when the reviewer needs a copyable target shape.

You may use one of these, you may use several, it is unlikely you will use all of them. Use judgment and do not overwhelm the reviewer.

### 3. Gather Evidence - images mandatory if frontend

No PR opens until every visual change has a before screenshot and an after screenshot on the image branch. Capture befores first, from the base ref, before writing the PR body. A body with after-only screenshots never opens. Non-visual changes (aria labels, live regions, summaries) need a code assertion or DOM check each, listed in the body.

One image branch per repo, always named exactly `pr-images`. Never derive the name from the feature branch (`pr-images-<feature>` is wrong). Create it as an orphan branch (no shared history, never merged) if it does not exist. Store shots under `pr-<number>/` per pull request, one rerun-safe name per target (same PR plus target plus kind maps to the same path, overwrite in place).

### Pre-open checklist - fill this before the PR opens

Copy this table into the run notes. Every cell needs a value. An empty cell blocks the PR.

| # | Change | Type | Before screenshot URL | After screenshot URL | Verdict + confidence |
|---|--------|------|----------------------|---------------------|---------------------|
| 1 | <one change> | visual | <url> | <url> | <verdict (n%)> |
| 2 | <one change> | non-visual | N/A + check used | N/A + result | <verdict (n%)> |

Rules for the table:

- One row per change, not per page. A PR with 8 changes has 8 rows.
- `visual` rows need both URLs from the image branch. `N/A` in either cell blocks the PR.
- `non-visual` rows name the exact check (DOM query, axe run, key-parity gate) and its result.
- The PR body must show everything in this table. Nothing reaches the body that is not in the table first.

If the repo has a visual-regression setup (config file + Playwright): check out the PR head detached, find missing/stale specs, write them (one `toHaveScreenshot('<target>-<scheme>.png')` per color scheme, wait for the meaningful element never `networkidle`), commit/push specs before the visual run, run the pipeline without posting, then triage each diff (diff image first, then PR intent, then functionality spec, then source diff; verdicts `looks intentional` / `looks like a regression` / `not sure` with confidence 90-100% decisive, 70-85% mostly-agree, below 70% is `not sure`).

Otherwise: check out base, screenshot the route; check out head, screenshot the same route/viewport/color scheme. Use the repo's own Playwright install and `toHaveScreenshot` where possible. Never ship a UI PR with text-only evidence.

List interactive states per target and capture one scoped screenshot per state: modal open/closed, chip selected/unselected/multi-selected, dropdown open, tooltip/hover, focus, error, empty. Drive the UI into each state first (click the trigger, select the chip), then screenshot the component root. Scoped screenshots beat full-page shots here: smaller diffs, less noise. Long-locale labels (e.g. German) break chips and buttons first, so capture each state in each locale.

### 4. Call Merge Danger

**Door:** one-way (destructive, hard rollback: migration, data loss, public API removal, secret/config change) or two-way (revert-safe). **Blast Radius:** one word (e.g. `isolated`, `shared-component`, `auth`, `mobile-layout`) plus optional ramifications (layout shift, consumer breakage, responsiveness).

### 5. Post exactly one body

Check for a repo PR template first (`.github/PULL_REQUEST_TEMPLATE.md`, `docs/pull-request-template.md`). If one exists, use its headings verbatim and fit the skill sections inside it: visual summary plus evidence screenshots under its description section, type checkboxes ticked to match the change, merge danger (door plus blast radius) under its risks/comments section, contributor checklist boxes ticked only when true. Never invent a competing structure. If no template exists, use this shape (preserve every image URL exactly, one collapsible section per visual target):

```markdown
## Summary

<visual + 2-3 lines>

## Evidence

- **Before:** ![before](<url>) / failing test + output
- **After:** ![after](<url>) / passing test + output

<details>
<summary><target> (<scheme>) screenshots</summary>

**Diff**

![diff](<url>)

| Before | After |
|---|---|
| ![before](<url>) | ![after](<url>) |

</details>

## Merge Danger

**Door:** <one-way or two-way>
**Blast Radius:** <one-word>
<optional ramifications>
```

Backend-only PRs use the same shape with test/console output instead of images. Do not post extra triage, setup, or "pipeline completed" comments. Do not paste raw pre-commit hook output. Omit passing gates entirely. State a failing gate in one or two sentences only when it changes the verdict.

## Accessibility gate

Run an automated check per route and locale (e.g. axe). A new violation is a regression. No exceptions.

Walk every new dialog with the keyboard only:

- Tab stays inside the dialog. Focus never escapes to the page behind it.
- Esc closes the dialog.
- Focus returns to the trigger control after close.
- The dialog has `role="dialog"`, `aria-modal="true"`, and an accessible name.

A dialog that fails any of these fails the gate. State the gate and the result in the PR body.

## Authentication

Some routes sit behind login. A screenshot of a sign-in wall is not evidence for the page behind it.

- Detect it: redirect to sign-in, a login form instead of content, or auth errors in the console.
- Ask the user for credentials. Use a test account, never a personal one. Read secrets from environment variables. Never write them into specs, logs, screenshots, or the PR body. Never commit them.
- If the account uses MFA/2FA with TOTP: ask the user for the TOTP secret (the seed, not a one-time code). Generate a fresh code at login time with `oathtool --base32 --totp "$TOTP_SECRET"` and submit it at once. Codes expire in 30 seconds. Never ask for, log, or reuse single codes across runs.
- Log in once per run. Save the session (`storageState`) and reuse it for all screenshots. Log in again only when the session expires.
- Keep secrets out of pixels: mask password fields, tokens, and personal data in every screenshot.

## Language - ASD-STE100
Write all prose in ASD-STE100 Simplified Technical English:

- Descriptive sentences: maximum 25 words. Instructions: maximum 20 words, one instruction per sentence.
- Active voice. One idea per sentence. Use lists for sequences, not paragraphs.
- One term per concept: always "screenshot", never "snapshot", "capture", or "image" for the same thing. Same rule for "merge", "target", "route", "key".
- No idioms and no vague language: not "fan out", "worth a look", "all good", "kind of", "a few".
- Technical names (components, routes, keys, commands) are permitted; write them exactly as in code.
- Example, not STE100: "Found some new screens without visual tests, so I added them."
  STE100: "Three screens have no visual tests. I added tests for these screens."

## Quick reference

| Situation | Do this |
| --------- | ------- |
| UI files changed | Before/after/diff images required, same route + viewport + scheme |
| New page, no before exists | Report `added tests`, no diff table for it |
| Diff spans whole page | Read full images, do not crop away signal |
| Dynamic content dominates diff | Verdict `not sure`, recommend `maskSelectors` |
| No screenshot URLs exist | Mark target `couldn't check`, finish report |

## Common mistakes

- **Text-only frontend PR** - "small CSS tweak, no screenshot needed" always hides regressions; capture before/after.
- **Multiple comments** - one PR body/report per run; never post extras or update old visual-QA comments.
- **Claiming upload failure** - unless CLI output says `couldn't upload screenshot(s)`, preserve URLs as-is.
- **Guessing routes** - if the route for a touched component is uncertain, skip it rather than screenshotting the wrong page.
- **PR description as proof** - description says what was meant, pixels say what happened; both must agree before `looks intentional`.
- **Non-STE100 prose** - sentences over 25 words, passive voice, mixed terms ("snapshot" and "screenshot" for one thing), or idioms; rewrite to short active sentences with one term per concept.
