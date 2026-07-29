# Repository Instructions

## Purpose

This repo publishes my personal agent skills as an installable skill collection. Keep it simple: flat structure, no build step, no publishing machinery.

## Editing Rules

- Keep skill files in `skills/<skill-name>/SKILL.md`.
- Every skill needs YAML frontmatter with `name` and `description`.
- Descriptions say **when** the skill triggers - specific situations and symptoms, third person, starting with "Use when...". Never summarize the workflow in the description.
- Use progressive disclosure. Put long references in `references/` inside the skill folder and link them from `SKILL.md`.
- A skill may carry a human-facing `README.md` next to its `SKILL.md`.
- Do not add generated build artifacts.
- Do not vendor third-party plugin caches.

## Quality Bar

Before committing:

```bash
node scripts/verify-skills.mjs
node scripts/list-skills.mjs
```

## Domain Docs

Single-context repo. Use `CONTEXT.md` and `docs/adr/`.
