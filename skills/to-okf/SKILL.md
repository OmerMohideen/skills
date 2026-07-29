---
name: to-okf
description: Use when asked to map, document, or "OKF-ify" a codebase, build an agent-readable knowledge base of a repo, generate an OKF bundle, or refresh an existing bundle after code changes.
---

# to-okf

Turn a codebase into an [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle: a directory of markdown concept docs with YAML frontmatter that agents navigate through `index.md` files instead of re-reading the whole repo every session.

Default output: `okf/` at the repo root (a subdirectory bundle - spec section 3). If `okf/` already exists, switch to **refresh mode** (step 7).

## Principles

- **Specs first.** Existing docs (specs, ADRs, CONTEXT.md, READMEs) are the highest-trust source for *why*; code is ground truth for *what exists*. When they disagree, trust code for structure, keep the doc's stated intent, and flag the conflict to the user.
- **One concept per file.** Keep docs under ~100 lines. Summarize interfaces; never dump source. The bundle is a map, not a mirror.
- **Progressive disclosure.** Every directory gets an `index.md` with one-line descriptions, so an agent can load the root index cold and drill down only where needed. That navigation property is the entire point - optimize for it.
- **Graph, not just tree.** Cross-link concepts with bundle-relative links (`/modules/auth.md`). Broken links are tolerated by the spec (section 5.3), but keep them rare.
- **Compile once, read many.** The bundle replaces re-deriving the same context every session - curated knowledge, not per-session retrieval. Keep it current and every future session starts smarter.
- **Read/write, not read-only.** When work reveals something durable (a gotcha, a decision, a new dependency), update the concept and append to `log.md`. A bundle agents only read goes stale and dies; the log doubles as the audit trail.

## Workflow

### 1. Locate knowledge sources

Read whatever exists - this step happens before touching code structure:

- `CONTEXT.md`, `README.md`, `AGENTS.md` / `CLAUDE.md`
- `specs/`, `spec/`, `docs/`, `design/`, `wiki/`
- `docs/adr/`, `adr/`, `.agents/adr/` (decision records)
- Ticket/issue dirs (`.scratch/`, `tickets/`)
- Manifests: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.

Each source either becomes its own concept (specs, ADRs) or feeds module concepts. Record what you used in each concept's `# Citations`.

### 2. Map the skeleton

Identify: entry points, top-level modules/packages, services, data stores/models, external APIs consumed and exposed, config surface. Depth target: what a new senior hire needs in week one - not every file.

### 3. Propose the bundle layout

Show the user the planned tree (directories + concept list) and get a yes before writing. Typical shape:

```
okf/
├── index.md          # root index; only index allowed frontmatter (okf_version)
├── log.md            # chronological history
├── overview.md       # type: Repository - what this is, how to run it
├── glossary.md       # type: Glossary - domain terms (from CONTEXT.md if present)
├── modules/          # one concept per top-level module/package
├── apis/             # exposed endpoints / public interfaces
├── data/             # stores, schemas, models
├── specs/            # existing spec docs, distilled
└── decisions/        # ADRs, one concept each
```

Adapt to the repo. A small repo may need only `overview.md` + `modules/`.

Folder names are the producer's free choice per spec section 3 - they play the same role `tables/` and `datasets/` play in Google's own example bundles. The spec only fixes the file conventions: every concept `.md` gets frontmatter with `type`, `index.md` and `log.md` are the only reserved names. Step 6 checks the result against the section 9 conformance list.

### 4. Write concept docs

Per concept: frontmatter with required `type` plus `title`, `description`, `tags`, `timestamp`; `resource` = repo-relative path (`src/auth/`) or canonical URI. Body in structural markdown: purpose, public interface (not internals), dependencies as links, `# Examples` where usage is non-obvious, `# Citations` to the sources used.

The full field list, conformance rules, suggested `type` values for codebases, and a filled-in example live in [references/okf-conventions.md](references/okf-conventions.md).

### 5. Index, link, log

- Generate `index.md` per directory: grouped bullets, `* [Title](file.md) - description from frontmatter`.
- Root `index.md` may carry `okf_version: "0.1"` frontmatter - the only `index.md` allowed frontmatter.
- Cross-link wherever one concept mentions another.
- Create `log.md` with an `**Initialization**` entry under today's `YYYY-MM-DD` heading.

### 6. Verify conformance

- Every non-reserved `.md` has parseable frontmatter with a non-empty `type`.
- `index.md` / `log.md` follow the spec section 6 and 7 shapes.
- Cold-navigation spot-check: read only the root `index.md` and one drill-down path. Could you find the concept you need without seeing the repo? If not, descriptions are too thin - fix them.

### 7. Refresh mode (existing `okf/`)

- Read `log.md` and the indexes, then diff against the code: new, changed, and deleted modules.
- Update affected concepts (bump `timestamp`), mint new ones, and mark removed ones as `**Deprecation**` entries in the log rather than deleting them silently.
- Append dated `**Update**` entries to `log.md`. Never rewrite log history.

## Common mistakes

- **Dumping code into concepts**: the bundle rots within a week. Link to `resource` paths instead.
- **Missing `description`**: indexes degrade into useless filename lists.
- **Nesting deeper than 3 levels**: defeats progressive disclosure. Flatten.
- **Mirroring the file tree exactly**: group by *concept*, not by directory. The bundle explains the system; it doesn't photocopy the repo.
