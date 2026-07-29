# OKF v0.1 conventions cheat sheet

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
| `timestamp` | Optional | ISO 8601 of last meaningful change. Bump on refresh. |

Producer-defined extra keys are allowed; consumers must not reject them.

## Body

Free-form markdown, but favor structure (headings, tables, code blocks) over prose. Conventional headings: `# Schema`, `# Examples`, `# Citations` (numbered list of external sources at the bottom).

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

Root `index.md` may start with frontmatter containing only `okf_version: "0.1"`.

## log.md shape

```markdown
# Directory Update Log

## 2026-07-18
* **Initialization**: Created bundle structure and root [index](/index.md).
* **Update**: Rebuilt [auth module](/modules/auth.md) after JWT migration.
* **Deprecation**: Retired `modules/legacy-login.md`.
```

Newest first. Append-only.

## Conformance (v0.1)

A bundle is conformant if: every non-reserved `.md` has parseable frontmatter with a non-empty `type`, and reserved files follow their section 6 and 7 shapes. Everything else is soft guidance.

## Suggested `type` values for codebases

Not registered - pick self-explanatory values and stay consistent within a bundle:

| Type | Use for |
| ---- | ------- |
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

## Example concept

```markdown
---
type: Module
title: Auth
description: Session issuance and verification for all API traffic.
resource: src/auth/
tags: [security, api]
timestamp: 2026-07-18T10:00:00Z
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

# Citations

[1] [Spec: auth redesign](/specs/auth-redesign.md)
[2] [ADR 0003: JWT over sessions](/decisions/0003-jwt.md)
```

## Consuming a bundle

Any agent that can read files is a consumer - point it at the bundle's root `index.md` and let it follow links. No SDK, no API: the file system is the interface. For a human-facing view, the [official repo](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) ships a proof-of-concept visualizer that renders any bundle as one self-contained interactive HTML file:

```bash
python -m reference_agent visualize --bundle <path-to-bundle>
```
