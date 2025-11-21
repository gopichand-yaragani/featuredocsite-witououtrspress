import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function removeFrontmatterBlock(raw: string) {
  const match = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) {
    return raw;
  }

  const block = match[0];
  if (
    block.includes('canonical: "https://docs.virima.com') &&
    block.includes('lastUpdated: "2025-11-18"')
  ) {
    const remaining = raw.slice(block.length).replace(/^\n+/, "");
    return remaining.startsWith("\uFEFF") ? remaining : remaining;
  }

  return raw;
}

function walk(directory: string) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let updated = 0;

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      updated += walk(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".mdx")) continue;

    const raw = fs.readFileSync(fullPath, "utf8");
    const cleaned = removeFrontmatterBlock(raw);
    if (cleaned !== raw) {
      fs.writeFileSync(fullPath, cleaned, "utf8");
      updated += 1;
    }
  }

  return updated;
}

function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    throw new Error(`Content root not found: ${CONTENT_ROOT}`);
  }
  const count = walk(CONTENT_ROOT);
  // eslint-disable-next-line no-console
  console.log(`Removed generated frontmatter from ${count} file(s).`);
}

main();


