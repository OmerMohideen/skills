import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("skills");

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  let currentKey = null;
  let block = [];

  const flush = () => {
    if (currentKey) data[currentKey] = block.join(" ").trim();
  };

  for (const line of match[1].split("\n")) {
    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyValue) {
      flush();
      currentKey = keyValue[1];
      const value = keyValue[2].trim();
      block = value === "|" || value === ">" ? [] : [value.replace(/^["']|["']$/g, "")];
      continue;
    }
    if (currentKey && /^\s+/.test(line)) {
      block.push(line.trim());
    }
  }
  flush();
  return data;
}

const entries = await readdir(root, { withFileTypes: true });
const skills = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, entry.name, "SKILL.md");
  try {
    const markdown = await readFile(file, "utf8");
    const meta = parseFrontmatter(markdown);
    skills.push({
      name: meta.name || entry.name,
      description: meta.description || "",
    });
  } catch {
    skills.push({ name: entry.name, description: "Missing SKILL.md" });
  }
}

skills.sort((a, b) => a.name.localeCompare(b.name));

for (const skill of skills) {
  const description = skill.description.replace(/\s+/g, " ");
  console.log(`${skill.name} - ${description}`);
}
