# to-okf

Turn a codebase into an [OKF v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle - a directory of small markdown concept docs that agents navigate through index files instead of re-reading the whole repo every session.

## What it does

1. **Reads all existing specs first** - `CONTEXT.md`, READMEs, `specs/`, `docs/`, ADRs, ticket dirs, manifests - before looking at code structure.
2. Maps the codebase skeleton (entry points, modules, services, data, APIs).
3. Proposes a bundle layout for approval, then writes it to `okf/`: one concept per file with YAML frontmatter (`type` required, plus provenance/trust/lifecycle fields), `index.md` per directory for progressive disclosure, cross-links between concepts, and a `log.md` history.
4. On re-run with an existing `okf/`, switches to refresh mode: diffs code against the bundle, updates changed concepts, and appends to the log.

The result is an agent-readable knowledge base that lives in git next to the code - the pattern behind Google's [Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) and Karpathy's LLM-wiki gist. Knowledge compiles once and stays current, instead of being re-derived every session - and because agents write learnings back into the bundle (with `log.md` as the audit trail), it compounds in value instead of rotting.

## How to invoke

```
/to-okf
```

Run it at the root of the repo you want mapped. Re-run after large refactors to refresh the bundle.

Kept in sync by trigger, not machinery: the skill fires after an AI agent makes changes to a repo that has an `okf/` bundle, and the refreshed bundle lands in the same change. No hooks, scripts, or CI to install.

## See also

- [`SKILL.md`](./SKILL.md) - the agent-facing workflow
- [`references/okf-conventions.md`](./references/okf-conventions.md) - condensed spec cheat sheet with an example concept
- [OKF spec v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) - the authoritative format rules
