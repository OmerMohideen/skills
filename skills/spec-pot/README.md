# spec-pot

Keeps specs, design docs, API contracts, and ADRs aligned with the code they describe. Drift is treated as a bug to fix in the same pass, not a doc-debt item to defer.

## What it does

1. **Finds the spec surface** - docs, ADRs, OpenAPI/schema files, README sections describing behavior.
2. **Extracts checkable claims** - signatures, defaults, contracts, invariants - skipping rationale prose.
3. **Diffs claims against code**, sorted by gap type (wiring/navigation, contracts, acceptance criteria, test coverage, logic/UX), using git history to narrow the search instead of eyeballing. Confirms fixes behaviorally, not just in text.
4. **Resolves every drift found** - updates the stale spec, fixes the drifted code, or flags an ambiguous conflict to the user - checked first against the repo's stated architectural rules (CLAUDE.md/AGENTS.md or equivalent).
5. **Leaves a trail** - records non-trivial spec updates in an existing changelog/ADR convention, and folds resolved per-feature spec docs into a canonical doc rather than letting them pile up as equals.

Every run ends resolved or explicitly flagged - never a silent "noted for later."

## How to invoke

Not a slash command - triggers on judgment. Bring it up after implementing a change that touches documented behavior, before trusting a spec's description of current behavior, during PR review when code and spec disagree, or by asking directly to check/sync spec drift.

## See also

- [`SKILL.md`](./SKILL.md) - the agent-facing workflow
- [`to-okf`](../to-okf/) - complementary: run spec-pot first to fix drift, then to-okf to capture the now-correct state into the knowledge bundle
