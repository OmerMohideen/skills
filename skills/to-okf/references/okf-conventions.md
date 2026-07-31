# OKF v0.2 conventions cheat sheet

Condensed from the [official spec](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md). When in doubt, the spec wins.

## Bundle

A directory of markdown files. **Concept** = one `.md` file; **concept ID** = its path minus `.md` (`modules/auth.md` becomes `modules/auth`). Reserved filenames, never usable for concepts:

| File | Purpose |
| ---- | ------- |
| `index.md` | Directory listing for progressive disclosure. No frontmatter (except `okf_version` at the bundle root only). |
| `log.md` | Chronological history, newest first, `YYYY-MM-DD` headings. |

## Frontmatter

| Field | Status | Notes |
| ----- | ------ | ----- |
| `type` | **REQUIRED** | Short kind string. Only hard requirement. Consumers must tolerate unknown types. |
| `title` | Recommended | Display name; consumers derive from filename if absent. |
| `description` | Recommended | One sentence. Feeds index entries and search snippets. |
| `resource` | Recommended | URI or repo-relative path identifying the underlying asset. Omit for abstract concepts. |
| `tags` | Optional | YAML list of short strings. |
| `sources` | Optional | Provenance: list of `{ id, resource, title, author, usage_count, last_modified }` the concept derives from. `resource` required per entry; sibling `usage_window: { from, to }` frames the counts. |
| `generated` | Optional | `{ by: <actor>, at: <ISO 8601> }`. Replaces v0.1 `timestamp`; records last meaningful change. |
| `verified` | Optional | List of `{ by: <actor>, at: <ISO 8601> }` confirmations (a bare mapping = one-element list). Drives trust tiers. |
| `status` | Optional | `draft` \| `stable` (default) \| `deprecated`. |
| `stale_after` | Optional | Absolute `YYYY-MM-DD`; concept is stale when `today >= stale_after`. |

Actors (spec section 7): `<producer>/<version>` (agents/tools), `human:<id>`, `process:<id>`. Consumers key trust tiers off the `human:` prefix.

Producer-defined extra keys are allowed; consumers must not reject them.

## Body

Free-form markdown, but favor structure (headings, tables, code blocks) over prose. Conventional headings: `# Schema`, `# Examples`, `# Computation` (for `Attested Computation` concepts, spec section 10). Per-claim attribution uses markdown footnotes whose labels are `sources[].id` keys; consumers join through the matching `sources` entry, not by parsing footnote prose:

```markdown
The `events_` table is sharded daily as `events_YYYYMMDD`.[^ga4-schema]

[^ga4-schema]: GA4 BigQuery Export schema
```

Labels are keyed rather than positional so they survive agent rewrites that reorder the `sources` list.

## Cross-links

- **Bundle-relative** (recommended): `[customers](/tables/customers.md)` - leading `/` = bundle root. Stable when files move.
- **Relative**: `[other](./other.md)`.
- Links assert relationships; the prose around them carries the meaning. Broken links are legal (knowledge not yet written) - don't ship many.

## index.md shape

```markdown
# Group Heading

* [Title](concept.md) - one-line description
* [Subdirectory](subdir/) - what lives there
```

Root `index.md` may start with frontmatter containing only `okf_version: "0.2"`.

## log.md shape

```markdown
# Directory Update Log

## 2026-07-18
* **Initialization**: Created bundle structure and root [index](/index.md).
* **Update**: Rebuilt [auth module](/modules/auth.md) after JWT migration.
* **Deprecation**: Retired `modules/legacy-login.md`.
```

Newest first. Append-only.

## Conformance (v0.2)

A bundle is conformant if: every non-reserved `.md` has parseable frontmatter with a non-empty `type`, and reserved files follow their section 8 and 9 shapes. Consumers must not reject a bundle for missing optional families, unknown types or keys, broken links, or missing `index.md`. When the trust/lifecycle/provenance families are present, follow spec sections 5 through 10 (a bare `verified` mapping is a one-element list; trust tiers derive from `verified`).

## Suggested `type` values for codebases

Not registered - pick self-explanatory values and stay consistent within a bundle:

| Type | Use for |
| ---- | ------ |
| `Repository` | The `overview.md` concept: what the system is, how to run it |
| `Module` | Top-level package/module with its public interface |
| `Service` | Independently deployable/runnable unit |
| `API Endpoint` | Exposed HTTP/RPC/CLI surface |
| `Data Model` | Schema, table, message shape |
| `Glossary` | Domain terms (usually from CONTEXT.md) |
| `Spec` | A distilled requirements/design document |
| `Decision` | One ADR |
| `Runbook` | Operational procedure (deploy, rollback, on-call) |
| `Config` | Configuration surface and env vars |
| `Attested Computation` | A sanctioned way to compute a value, with `runtime`, `parameters`, `executor`, `attester` (spec section 10) |

## Example concept

```markdown
---
type: Module
title: Auth
description: Session issuance and verification for all API traffic.
resource: src/auth/
tags: [security, api]
status: stable
generated: { by: to-okf/okf-v0.2, at: 2026-07-18T10:00:00Z }
verified: { by: human:you, at: 2026-07-19T09:00:00Z }
stale_after: 2026-10-18
sources:
  - id: auth-redesign
    resource: specs/auth-redesign.md
    title: Spec - auth redesign
  - id: adr-0003
    resource: decisions/0003-jwt.md
    title: ADR 0003 - JWT over sessions
---

Issues JWT sessions at login and verifies them on every request.
Consumed by [api-server](/modules/api-server.md); configured via
[env config](/config/env.md).

# Interface

* `login(credentials) -> token` - POST /auth/login
* `verify(token) -> claims` - middleware, runs on all routes

# Examples

```bash
curl -X POST localhost:3000/auth/login -d '{"user":"a","pass":"b"}'
```

JWT signing follows the redesign spec[^auth-redesign] and the
ADR's migration path.[^adr-0003]

[^auth-redesign]: Spec - auth redesign
[^adr-0003]: ADR 0003 - JWT over sessions
```

## Consuming a bundle

Any agent that can read files is a consumer - point it at the bundle's root `index.md` and let it follow links. No SDK, no API: the file system is the interface. For a human-facing view, the [official repo](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) ships a proof-of-concept visualizer that renders any bundle as one self-contained interactive HTML file:

```bash
python -m reference_agent visualize --bundle <path-to-bundle>
```
