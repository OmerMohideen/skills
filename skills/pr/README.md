# pr

Writes PR bodies reviewers can merge with confidence: a visual summary, concrete evidence, and an explicit merge-risk call — in ASD-STE100 Simplified Technical English.

## What it does

1. **Scopes the PR** - finds the base without guessing, lists touched files, flags frontend surface (components, routes, styles, assets).
2. **Writes a visual summary** - the smallest sketch that makes the point: pseudocode, call tree, component tree, file tree, Mermaid, or a diff-sketch next to the text it supports.
3. **Gathers evidence, images mandatory if frontend** - before/after screenshots at the same route, viewport, and color scheme, hosted on a dedicated orphan image branch. One scoped screenshot per interactive state (modal open/closed, chip selected/unselected, per locale). New pages report as added tests. Per-locale and per-scheme coverage where the app supports it. Auth-gated routes log in with user-supplied test credentials (TOTP secret for MFA, never single codes), reuse one saved session, and keep secrets out of pixels.
4. **Runs the gates** - translation key parity, accessibility (axe per route/locale plus keyboard walkthrough of dialogs), and the repo's own suite. Failing gates that change the verdict get a line; passing gates stay silent.
5. **Calls merge danger** - one-way or two-way door, plus a one-word blast radius with ramifications. Shared-component changes carry fan-out evidence for every affected surface.
6. **Posts exactly one body** - fills the pre-open evidence checklist first (one row per change, both URLs or a named check each), then writes the body. Follows the repo's PR template when one exists, mapping skill sections into its headings.

Every frontend PR ships pictures, not claims. Text says what changed; pictures prove it.

## How to invoke

Not a slash command - triggers on judgment. Bring it up when opening or rewriting a PR body, when asked to make a change reviewable, or when UI or visual output changed and before/after screenshots are required.

## See also

- [`SKILL.md`](./SKILL.md) - the agent-facing workflow
- [`CREDITS.md`](./CREDITS.md) - attribution for the adapted structure
