import fs from "fs";
import path from "path";
import Module from "module";
import { buildRoutePath } from "../src/utils/routeBuilder";
import { resolveMDXPath } from "../src/utils/mdxPathResolver";

type NavPage = {
  id: string;
  subPages?: NavPage[];
};

type NavSection = {
  id: string;
  pages?: NavPage[];
};

const CANONICAL_HOST =
  process.env.CANONICAL_HOST || "https://docs.virima.com";
const OUTPUT_PATH = path.join(process.cwd(), "public", "sitemap.xml");

interface RouteDescriptor {
  version: string;
  module: string;
  section: string;
  page: string;
}

type NavigationConfig = {
  versions: string[];
  modules: { id: string; label: string }[];
  sectionsByModule: Record<string, NavSection[]>;
};

const loadNavigationConfig = async (): Promise<NavigationConfig> => {
  const moduleConstructor = Module as unknown as {
    _resolveFilename: (
      request: string,
      parent: any,
      isMain: boolean,
      options: any
    ) => string;
  };
  const originalResolve = moduleConstructor._resolveFilename.bind(Module);
  moduleConstructor._resolveFilename = function resolveWithPinnedSupport(
    request: string,
    parent: any,
    isMain: boolean,
    options: any
  ) {
    const stripped = request.replace(/@(\d+(?:\.\d+){1,2}[^/]*)$/, "");
    if (stripped !== request) {
      try {
        return originalResolve(stripped, parent, isMain, options);
      } catch (error) {
        // Fall back to original request if stripped module fails
      }
    }
    return originalResolve(request, parent, isMain, options);
  };

  try {
    const layoutModule = await import("../src/components/DocumentationLayout.tsx");
    if (!layoutModule.navigationConfig) {
      throw new Error("navigationConfig export not found in DocumentationLayout.tsx");
    }
    return layoutModule.navigationConfig as NavigationConfig;
  } finally {
    moduleConstructor._resolveFilename = originalResolve;
  }
};

const collectRoutes = (navigationConfig: NavigationConfig): RouteDescriptor[] => {
  const routes: RouteDescriptor[] = [];

  const traverseSubPages = (
    subPages: NavPage[],
    version: string,
    moduleId: string,
    sectionId: string
  ) => {
    for (const subPage of subPages) {
      if (!subPage.id) continue;
      routes.push({ version, module: moduleId, section: sectionId, page: subPage.id });
      if (subPage.subPages) {
        traverseSubPages(subPage.subPages, version, moduleId, sectionId);
      }
    }
  };

  const collectSectionPages = (
    section: NavSection,
    version: string,
    moduleId: string
  ) => {
    if (!section.pages) return;
    for (const page of section.pages) {
      if (!page.id) continue;
      routes.push({ version, module: moduleId, section: section.id, page: page.id });
      if (page.subPages) {
        traverseSubPages(page.subPages, version, moduleId, section.id);
      }
    }
  };

  for (const version of navigationConfig.versions) {
    for (const moduleEntry of navigationConfig.modules) {
      const moduleId = moduleEntry.id;
      const sections =
        navigationConfig.sectionsByModule[moduleId] ||
        navigationConfig.sectionsByModule.default;
      if (!sections) continue;

      for (const section of sections) {
        collectSectionPages(section, version, moduleId);
      }
    }
  }

  return routes;
};

const ensureDirectory = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const toXml = (routes: RouteDescriptor[]) => {
  const urls = routes
    .map((route) => {
      const routePath = buildRoutePath(route);
      if (!routePath || routePath === "/") {
        return null;
      }

      let lastmod = new Date().toISOString().slice(0, 10);
      try {
        const mdxPath = resolveMDXPath(route);
        if (mdxPath) {
          const filePath = path.join(
            process.cwd(),
            "src",
            mdxPath.replace(/^\/content\//, "content/")
          );
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            lastmod = stats.mtime.toISOString().slice(0, 10);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Unable to determine last modified date for", route, error);
      }

      const loc = `${CANONICAL_HOST}${routePath}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const main = async () => {
  const navigationConfig = await loadNavigationConfig();
  const routes = collectRoutes(navigationConfig);
  const xml = toXml(routes);
  ensureDirectory(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Sitemap generated at ${OUTPUT_PATH} with ${routes.length} entries.`);
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to generate sitemap:", error);
  process.exit(1);
});


