// Checks an okf/ bundle against OKF v0.1 conformance (spec section 9): every
// non-reserved .md has frontmatter with a non-empty `type`; index.md/log.md
// follow their reserved shapes. Exits 1 on any failure.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "okf");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

function getFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

if (!(await stat(root).catch(() => null))) {
  console.error(`no bundle at ${root}`);
  process.exit(1);
}

const files = await walk(root);
const rel = (f) => path.relative(root, f).replace(/\\/g, "/");

const rootIndex = path.join(root, "index.md");
if (!files.includes(rootIndex)) fail("missing root index.md");

const log = path.join(root, "log.md");
if (!files.includes(log)) fail("missing root log.md");
else {
  const logMd = await readFile(log, "utf8");
  if (!/^# .+/m.test(logMd)) fail("log.md: missing heading");
  if (!/^## \d{4}-\d{2}-\d{2}/m.test(logMd)) fail("log.md: no dated (YYYY-MM-DD) entries");
}

for (const file of files) {
  const name = path.basename(file);
  const markdown = await readFile(file, "utf8");

  if (name === "log.md") continue; // checked above

  if (name === "index.md") {
    const fm = getFrontmatter(markdown);
    if (fm && file !== rootIndex) fail(`${rel(file)}: index.md must not carry frontmatter (only bundle root may)`);
    if (fm && file === rootIndex && !/^okf_version:/m.test(fm)) fail(`${rel(file)}: root index.md frontmatter must be okf_version only`);
    continue;
  }

  const fm = getFrontmatter(markdown);
  if (!fm) {
    fail(`${rel(file)}: missing YAML frontmatter`);
    continue;
  }
  const type = fm.match(/^type:\s*(.+)$/m)?.[1]?.trim();
  if (!type) fail(`${rel(file)}: missing non-empty "type"`);
}

if (failures > 0) {
  console.error(`\n${failures} verification failure(s).`);
  process.exit(1);
}

console.log(`Verified ${files.length} okf concept file(s) in ${rel(root) || "."}.`);
