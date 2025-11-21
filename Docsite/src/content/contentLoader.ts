/**
 * Content Loader - Statically imports all MDX content files
 * This file maps file paths to their actual content for runtime access
 */

// Import My Dashboard 6.1 content
import dashboards61 from './6_1/my_dashboard_6_1/dashboards-6_1.mdx?raw';
import dashboardsContents61 from './6_1/my_dashboard_6_1/dashboards-contents-6_1.mdx?raw';
import dashboardsCustomization61 from './6_1/my_dashboard_6_1/dashboards-customization-6_1.mdx?raw';
import dashboardsReportActions61 from './6_1/my_dashboard_6_1/dashboards-report-actions-6_1.mdx?raw';
import myDashboard61 from './6_1/my_dashboard_6_1/my-dashboard-6_1.mdx?raw';
import myDashboardContents61 from './6_1/my_dashboard_6_1/my-dashboard-contents-6_1.mdx?raw';
import myDashboardOverview61 from './6_1/my_dashboard_6_1/my-dashboard-overview-6_1.mdx?raw';
import systemIcons61 from './6_1/my_dashboard_6_1/system-icons-6_1.mdx?raw';

// Import NextGen content
import ngSystemIcons from './NG/my-dashboard/system-icons.mdx?raw';
import ngCmdbOverview from './NG/cmdb/overview.mdx?raw';
import ngDiscoveryScanOverview from './NG/discovery-scan/overview.mdx?raw';
import ngItsmOverview from './NG/itsm/overview.mdx?raw';
import ngItamOverview from './NG/itam/overview.mdx?raw';
import ngVulnerabilityManagementOverview from './NG/vulnerability-management/overview.mdx?raw';
import ngSelfServiceOverview from './NG/self-service/overview.mdx?raw';
import ngProgramProjectManagementOverview from './NG/program-project-management/overview.mdx?raw';
import ngRiskRegisterOverview from './NG/risk-register/overview.mdx?raw';
import ngReportsOverview from './NG/reports/overview.mdx?raw';

/**
 * Content map - maps file paths to their content
 */
const contentMap: Record<string, string> = {
  // My Dashboard 6.1
  '/content/6_1/my_dashboard_6_1/dashboards-6_1.mdx': dashboards61,
  '/content/6_1/my_dashboard_6_1/dashboards-contents-6_1.mdx': dashboardsContents61,
  '/content/6_1/my_dashboard_6_1/dashboards-customization-6_1.mdx': dashboardsCustomization61,
  '/content/6_1/my_dashboard_6_1/dashboards-report-actions-6_1.mdx': dashboardsReportActions61,
  '/content/6_1/my_dashboard_6_1/my-dashboard-6_1.mdx': myDashboard61,
  '/content/6_1/my_dashboard_6_1/my-dashboard-contents-6_1.mdx': myDashboardContents61,
  '/content/6_1/my_dashboard_6_1/my-dashboard-overview-6_1.mdx': myDashboardOverview61,
  '/content/6_1/my_dashboard_6_1/system-icons-6_1.mdx': systemIcons61,
  // NextGen content
  '/content/NG/my-dashboard/system-icons.mdx': ngSystemIcons,
  '/content/NG/cmdb/overview.mdx': ngCmdbOverview,
  '/content/NG/discovery-scan/overview.mdx': ngDiscoveryScanOverview,
  '/content/NG/itsm/overview.mdx': ngItsmOverview,
  '/content/NG/itam/overview.mdx': ngItamOverview,
  '/content/NG/vulnerability-management/overview.mdx': ngVulnerabilityManagementOverview,
  '/content/NG/self-service/overview.mdx': ngSelfServiceOverview,
  '/content/NG/program-project-management/overview.mdx': ngProgramProjectManagementOverview,
  '/content/NG/risk-register/overview.mdx': ngRiskRegisterOverview,
  '/content/NG/reports/overview.mdx': ngReportsOverview,
};

/**
 * Get content for a given file path
 * @param filePath - The path to the content file
 * @returns The content string or null if not found
 */
export function getContent(filePath: string): string | null {
  return contentMap[filePath] || null;
}

/**
 * Simple frontmatter parser (browser-safe, no Buffer dependency)
 * Extracts frontmatter from YAML between --- delimiters
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  // Simple YAML parser for basic key-value pairs (browser-safe)
  const frontmatter: Record<string, unknown> = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();
    
    // Remove quotes if present
    if (typeof value === 'string') {
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
    }
    
    frontmatter[key] = value;
  }
  
  return { frontmatter, body };
}

interface ContentEntry {
  body: string;
  frontmatter: Record<string, unknown>;
}

const parsedContentCache = new Map<string, ContentEntry>();

/**
 * Return MDX content and parsed frontmatter for a given file path (browser-safe).
 */
export function getContentEntry(filePath: string): ContentEntry | null {
  if (parsedContentCache.has(filePath)) {
    return parsedContentCache.get(filePath)!;
  }

  try {
    const raw = getContent(filePath);
    if (!raw) return null;

    const { frontmatter, body } = parseFrontmatter(raw);
    const entry: ContentEntry = {
      body: body.startsWith('\n') ? body.slice(1) : body,
      frontmatter,
    };

    parsedContentCache.set(filePath, entry);
    return entry;
  } catch (error) {
    console.error(`Error parsing content for ${filePath}:`, error);
    return null;
  }
}

/**
 * Return only the parsed frontmatter for a given file path.
 */
export function getContentFrontmatter(filePath: string): Record<string, unknown> | null {
  const entry = getContentEntry(filePath);
  return entry ? entry.frontmatter : null;
}

/**
 * Return the MDX body content (without frontmatter) for a given file path.
 */
export function getContentBody(filePath: string): string | null {
  const entry = getContentEntry(filePath);
  return entry ? entry.body : null;
}

/**
 * Check if content exists for a given file path
 * @param filePath - The path to the content file
 * @returns True if content exists, false otherwise
 */
export function hasContent(filePath: string): boolean {
  return filePath in contentMap;
}

/**
 * Get all available content paths
 * @returns Array of all available content file paths
 */
export function getAvailablePaths(): string[] {
  return Object.keys(contentMap);
}
