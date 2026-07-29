#!/usr/bin/env node
// Git-hook manager for auto-refreshing okf/ via the to-okf skill: install/status/uninstall + auto-rebuild on commit.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const MARKER = "# okf-hook: managed by scripts/okf-hook.mjs";
const AUTO_COMMIT_MSG = "chore: auto-refresh okf bundle";
const HOOK_NAMES = ["post-commit", "post-checkout"];

function repoRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
}

function hookPath(root, name) {
  return path.join(root, ".git", "hooks", name);
}

function hookScript(root) {
  return `#!/bin/sh\n${MARKER}\nnode "${root.replace(/\\/g, "/")}/scripts/okf-hook.mjs" run "$@" &\n`;
}

function install() {
  const root = repoRoot();
  for (const name of HOOK_NAMES) {
    const p = hookPath(root, name);
    if (existsSync(p) && !readFileSync(p, "utf8").includes(MARKER)) {
      console.error(`skip ${name}: existing hook not managed by okf-hook, remove manually first`);
      continue;
    }
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, hookScript(root), { mode: 0o755 });
    console.log(`installed ${name}`);
  }
}

function uninstall() {
  const root = repoRoot();
  for (const name of HOOK_NAMES) {
    const p = hookPath(root, name);
    if (existsSync(p) && readFileSync(p, "utf8").includes(MARKER)) {
      rmSync(p);
      console.log(`removed ${name}`);
    }
  }
}

function status() {
  const root = repoRoot();
  for (const name of HOOK_NAMES) {
    const p = hookPath(root, name);
    const installed = existsSync(p) && readFileSync(p, "utf8").includes(MARKER);
    console.log(`${name}: ${installed ? "installed" : "not installed"}`);
  }
}

function changedFiles(root) {
  const out = execFileSync("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  return out.split("\n").filter(Boolean);
}

function lastCommitMessage(root) {
  return execFileSync("git", ["log", "-1", "--format=%s"], { cwd: root, encoding: "utf8" }).trim();
}

function run() {
  const root = repoRoot();
  if (!existsSync(path.join(root, "okf"))) return; // nothing to refresh yet

  if (lastCommitMessage(root) === AUTO_COMMIT_MSG) return; // avoid recursive hook trigger

  const changed = changedFiles(root).filter((f) => !f.startsWith("okf/"));
  if (changed.length === 0) return;

  const claude = spawnSync(
    "claude",
    ["-p", "Refresh the okf/ bundle for this repo using the to-okf skill's refresh mode. Only touch files under okf/."],
    { cwd: root, stdio: "inherit" }
  );
  if (claude.status !== 0) {
    console.error("okf-hook: claude refresh failed, skipping auto-commit");
    return;
  }

  const diff = spawnSync("git", ["status", "--porcelain", "--", "okf"], { cwd: root, encoding: "utf8" });
  if (!diff.stdout.trim()) return; // nothing changed

  const verify = spawnSync("node", ["scripts/verify-okf.mjs"], { cwd: root, stdio: "inherit" });
  if (verify.status !== 0) {
    console.error("okf-hook: refresh produced a non-conformant bundle, skipping auto-commit");
    return;
  }

  spawnSync("git", ["add", "okf"], { cwd: root });
  spawnSync("git", ["commit", "-m", AUTO_COMMIT_MSG], { cwd: root, stdio: "inherit" });
}

const cmd = process.argv[2];
const commands = { install, uninstall, status, run };
if (!commands[cmd]) {
  console.error("usage: node scripts/okf-hook.mjs <install|uninstall|status|run>");
  process.exit(1);
}
commands[cmd]();
