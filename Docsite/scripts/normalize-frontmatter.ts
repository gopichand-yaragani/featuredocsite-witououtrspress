import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const CANONICAL_HOST = process.env.CANONICAL_HOST || "https://docs.virima.com";
const TODAY = new Date().toISOString().slice(0, 10);

const SEGMENT_OVERRIDES: Record<string, string> = {
  NG: "NextGen",
};

function sanitizePlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
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
      return sanitizePlainText(line.slice(2).trim());
    }
  }
  const fallback = lines.find((line) => line.trim().length > 0);
  if (fallback) {
    return sanitizePlainText(fallback.trim().replace(/^#+\s*/, ""));
  }
  return "Virima Documentation";
}

function deriveDescription(lines: string[]): string {
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("#") || line.startsWith("![")) continue;
    if (line.startsWith("<")) continue;
    if (line.startsWith("---")) continue;
    if (line.startsWith("{")) continue;
    const normalized = sanitizePlainText(line);
    if (normalized) {
      return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
    }
  }
  return "Virima documentation topic.";
}

function deriveKeywords(title: string): string[] {
  const plainTitle = sanitizePlainText(title);
  const words = plainTitle
    .split(/[\s-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  const base = [plainTitle, ...words, "Virima"];
  const unique = Array.from(new Set(base));
  return unique.slice(0, 6);
}

function stripLeadingFrontmatterBlocks(content: string) {
  let working = content.replace(/^\uFEFF/, "");
  while (working.startsWith("---\n")) {
    const parsed = matter(working);
    working = parsed.content.replace(/^\uFEFF/, "");
    if (!working.startsWith("---\n")) {
      return { content: working.trimStart(), data: parsed.data };
    }
    // Merge data and continue stripping
  }
  return { content: working, data: {} };
}

function processFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const withoutBom = raw.replace(/^\uFEFF/, "");
  const parsed = matter(withoutBom);

  let content = parsed.content.replace(/^\uFEFF/, "").trimStart();
  let residualData: Record<string, unknown> = {};

  // Remove any additional frontmatter blocks that were part of the previous export
  if (content.startsWith("---\n")) {
    const result = stripLeadingFrontmatterBlocks(content);
    content = result.content;
    residualData = result.data;
  }

  const lines = content.split(/\r?\n/);
  const title = deriveTitle(lines);
  const description = deriveDescription(lines);
  const keywords = deriveKeywords(title);
  const relativePath = path.relative(CONTENT_ROOT, filePath);
  const canonicalPath = normalizeCanonicalPath(relativePath);

  const data: Record<string, unknown> = {
    ...residualData,
    ...parsed.data,
    title,
    description,
    canonical: `${CANONICAL_HOST}${canonicalPath}`,
    keywords,
    lastUpdated: parsed.data?.lastUpdated || TODAY,
  };

  // Ensure keywords is stored as array of strings
  if (Array.isArray(data.keywords)) {
    data.keywords = Array.from(
      new Set(
        (data.keywords as unknown[])
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => sanitizePlainText(item).trim())
      )
    );
  } else {
    data.keywords = keywords;
  }

  const stringified = matter.stringify(content.trimStart(), data as Record<string, unknown>, {
    delimiters: "---",
  });
  fs.writeFileSync(filePath, stringified.endsWith("\n") ? stringified : `${stringified}\n`, "utf8");
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
  console.log(`Normalized frontmatter in ${count} file(s).`);
}

main();


