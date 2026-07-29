# My Skills

My personal agent skills - small, composable, easy to adapt.

## Quickstart

Install with `skills.sh`:

```bash
npx skills@latest add YOUR_USERNAME/skills
```

Pick the skills you want for Claude Code, Codex, Gemini, Cursor, Windsurf, Cline, Copilot, or any agent supported by the installer.

## Skills


### `to-okf`

Turns a codebase into an [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) bundle. Reads all existing specs first (CONTEXT.md, specs/, docs/, ADRs), maps the skeleton, then writes `okf/` - small concept docs with YAML frontmatter, per-directory `index.md` files for progressive disclosure, cross-links, and a `log.md`. Re-run refreshes the bundle after code changes.

Use when you want:

- an agent-readable knowledge base of a repo, so agents stop re-scanning the whole codebase
- a structured map of modules, APIs, data models, and decisions that lives in git
- a refresh pass that keeps the bundle in sync as the code evolves

Auto-refresh via git hooks: once `okf/` exists, `npm run okf:hook:install` wires `post-commit`/`post-checkout` hooks that call `claude -p` to refresh the bundle after any commit touching non-`okf/` files, then run `npm run verify:okf` and auto-commit only if conformant (`chore: auto-refresh okf bundle`). `npm run okf:hook:status` / `okf:hook:uninstall` to check or remove.

<!-- Add one ### section per skill here as you create them. -->

## Adding a skill

1. Copy `skills/example-skill/` to `skills/<skill-name>/`.
2. Rewrite `SKILL.md`: frontmatter (`name`, `description`) plus the body. Long reference material goes in `references/` and gets linked from `SKILL.md`.
3. Rewrite the skill's `README.md` for humans, and add a `### <skill-name>` section above.
4. Check everything:

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
