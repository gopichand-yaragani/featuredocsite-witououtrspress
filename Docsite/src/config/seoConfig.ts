export interface DefaultSeoConfig {
  canonicalHost: string;
  titleSuffix: string;
  defaultDescription: string;
  defaults: Record<string, string>;
}

const FALLBACK_HOST = "https://docs.virima.com";

export const seoConfig: DefaultSeoConfig = {
  canonicalHost: import.meta.env.VITE_CANONICAL_HOST || FALLBACK_HOST,
  titleSuffix: "Virima Documentation",
  defaultDescription:
    "Virima product documentation covering modules, dashboards, and configuration guides.",
  defaults: {
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1.0",
    "theme-color": "#00A651",
    "color-scheme": "light",
    "og:site_name": "Virima Docs",
    "og:type": "website",
    "og:locale": "en_US",
    "twitter:card": "summary_large_image",
    distribution: "global",
    language: "en",
  },
};

export const DEFAULT_OG_IMAGE = "/assets/images/Virima_logo.png";

export const isIndexingAllowed =
  (import.meta.env.VITE_ALLOW_INDEXING ?? "true").toLowerCase() !== "false";


