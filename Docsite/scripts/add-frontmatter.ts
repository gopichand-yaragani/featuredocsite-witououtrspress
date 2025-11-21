import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const CANONICAL_HOST = process.env.CANONICAL_HOST || "https://docs.virima.com";
const TODAY = new Date().toISOString().slice(0, 10);

const SEGMENT_OVERRIDES: Record<string, string> = {
  NG: "NextGen",
};

function escapeDoubleQuotes(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function normalizeCanonicalPath(relativePath: string) {
  const withoutExtension = relativePath.replace(/\\/g, "/").replace(/\.mdx$/i, "");
  const segments = withoutExtension.split("/").map((segment) => {
    if (SEGMENT_OVERRIDES[segment]) {
      return SEGMENT_OVERRIDES[segment];
    }
    return segment;
  });
  return `/${segments.join("/")}`;
}

function deriveTitle(lines: string[]): string {
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("# ")) {
      return line.slice(2).trim();
    }
  }
  // Fallback: use first non-empty line
  const fallback = lines.find((line) => line.trim().length > 0);
  if (fallback) {
    return fallback.trim().replace(/^#+\s*/, "");
  }
  return "Virima Documentation";
}

function deriveDescription(lines: string[]): string {
  let capture = "";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("#")) {
      continue;
    }
    if (line.startsWith("![")) {
      continue;
    }
    if (line.startsWith("<")) {
      continue;
    }
    capture = line.replace(/\s+/g, " ").trim();
    break;
  }

  if (!capture) {
    return "Virima documentation topic.";
  }

  if (capture.length > 240) {
    return `${capture.slice(0, 237)}...`;
  }
  return capture;
}

function deriveKeywords(title: string): string[] {
  const base = title
    .split(/[\s-]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const unique = Array.from(new Set([title, ...base.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()), "Virima"]));
  return unique.slice(0, 6);
}

function buildFrontmatter(filePath: string, content: string) {
  const lines = content.split(/\r?\n/);
  const title = deriveTitle(lines);
  const description = deriveDescription(lines);
  const keywords = deriveKeywords(title);
  const relativePath = path.relative(CONTENT_ROOT, filePath);
  const canonicalPath = normalizeCanonicalPath(relativePath);

  const frontmatterLines = [
    "---",
    `title: "${escapeDoubleQuotes(title)}"`,
    `description: "${escapeDoubleQuotes(description)}"`,
    `canonical: "${CANONICAL_HOST}${canonicalPath}"`,
    "keywords:",
    ...keywords.map((keyword) => `  - ${escapeDoubleQuotes(keyword)}`),
    `lastUpdated: "${TODAY}"`,
    "---",
    "",
  ];

  return frontmatterLines.join("\n");
}

function hasFrontmatter(content: string) {
  return content.startsWith("---\n");
}

function processFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  if (hasFrontmatter(raw)) {
    return false;
  }

  const frontmatter = buildFrontmatter(filePath, raw);
  fs.writeFileSync(filePath, `${frontmatter}${raw}`, "utf8");
  return true;
}

function walkDirectory(directory: string) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let updated = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      updated += walkDirectory(path.join(directory, entry.name));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith(".mdx")) continue;

    const filePath = path.join(directory, entry.name);
    if (processFile(filePath)) {
      // eslint-disable-next-line no-console
      console.log(`Added frontmatter: ${path.relative(CONTENT_ROOT, filePath)}`);
      updated += 1;
    }
  }

  return updated;
}

function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    throw new Error(`Content root not found: ${CONTENT_ROOT}`);
  }

  const count = walkDirectory(CONTENT_ROOT);
  // eslint-disable-next-line no-console
  console.log(`Frontmatter added to ${count} file(s).`);
}

main();


