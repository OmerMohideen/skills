# My Skills

My personal agent skills - small, composable, easy to adapt.

## Quickstart

Install with `skills.sh`:

```bash
npx skills@latest add YOUR_USERNAME/skills
```

Pick the skills you want for Claude Code, Codex, Gemini, Cursor, Windsurf, Cline, Copilot, or any agent supported by the installer.

## Skills

### `spec-pot`

Keeps specs, design docs, API contracts, and ADRs aligned with the code they describe. Finds the spec surface, extracts checkable claims, diffs them against code by gap type (wiring/navigation, contracts, acceptance criteria, test coverage, logic/UX) using git history to narrow the search, then resolves every drift found - updates the stale spec, fixes the drifted code, or flags an ambiguous conflict. Checks fixes against the repo's stated architectural rules first, and folds resolved per-feature spec docs into a canonical doc instead of letting them pile up.

Use when you want:

- drift between docs/specs and code caught and fixed in the same pass, not deferred
- a spec you can actually trust before relying on its description of current behavior
- per-feature spec docs consolidated into one canonical doc instead of piling up unstatused

Pairs with `to-okf`: run `spec-pot` first to fix drift, then `to-okf` to capture the now-correct state into the bundle.

### `to-okf`

Turns a codebase into an [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle. Reads all existing specs first (CONTEXT.md, specs/, docs/, ADRs), maps the skeleton, then writes `okf/` - small concept docs with YAML frontmatter, per-directory `index.md` files for progressive disclosure, cross-links, and a `log.md`. Re-run refreshes the bundle after code changes.

Use when you want:

- an agent-readable knowledge base of a repo, so agents stop re-scanning the whole codebase
- a structured map of modules, APIs, data models, and decisions that lives in git
- a refresh pass that keeps the bundle in sync as the code evolves

Auto-refresh via git hooks: say "install the okf hook" and Claude writes `post-commit`/`post-checkout` directly - no scripts or `package.json` entries needed, portable to any repo the skill is installed on. They call `claude -p` to refresh the bundle after any commit touching non-`okf/` files, then auto-commit only if conformant (`chore: auto-refresh okf bundle`). "check the okf hook" / "remove the okf hook" for status/uninstall.

```bash
npm run verify   # validates frontmatter across all skills
npm run list     # prints every skill with its description
```

## Repo layout

```
skills/<skill-name>/SKILL.md     # the skill (YAML frontmatter + body)
skills/<skill-name>/README.md    # optional human-facing page
skills/<skill-name>/references/  # optional progressive-disclosure docs
scripts/                         # list-skills.mjs, verify-skills.mjs
CLAUDE.md / AGENTS.md            # agent instructions
```

## Contributing

Skills should be:

- Small enough to read quickly.
- Triggered by clear user intent (the `description` says when, not what).
- Progressive: load only the extra files needed.
- Specific about workflow and validation.
- Free of repo-specific assumptions unless the skill says so.

## License

MIT - see [LICENSE](./LICENSE).
