import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, isIndexingAllowed, seoConfig } from "../config/seoConfig";

export interface BreadcrumbEntry {
  label: string;
  path: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  lastUpdated?: string;
  ogImage?: string;
  noindex?: boolean;
}

interface SeoProps {
  page: PageSeo | null;
  fallbackTitle: string;
  fallbackDescription: string;
  canonicalPath: string | null;
  breadcrumbs: BreadcrumbEntry[];
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function Seo({
  page,
  fallbackTitle,
  fallbackDescription,
  canonicalPath,
  breadcrumbs,
}: SeoProps) {
  const title = page?.title || fallbackTitle;
  const description = page?.description || fallbackDescription || seoConfig.defaultDescription;
  const canonicalUrl =
    (page?.canonical || (canonicalPath ? `${seoConfig.canonicalHost}${canonicalPath}` : null)) ??
    seoConfig.canonicalHost;

  const keywords = page?.keywords?.length ? page.keywords.join(", ") : undefined;
  const ogImage = page?.ogImage || DEFAULT_OG_IMAGE;
  const pageIndexable = isIndexingAllowed && !page?.noindex;
  const robotsValue = pageIndexable ? "index, follow" : "noindex, nofollow";
  const lastUpdated = page?.lastUpdated || todayISO();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Virima Documentation",
        item: seoConfig.canonicalHost,
      },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.label,
        item: `${seoConfig.canonicalHost}${crumb.path}`,
      })),
      {
        "@type": "ListItem",
        position: breadcrumbs.length + 2,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    author: { "@type": "Organization", name: "Virima" },
    publisher: { "@type": "Organization", name: "Virima" },
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    mainEntityOfPage: canonicalUrl,
  };

  return (
    <Helmet>
      <title>{`${title} – ${seoConfig.titleSuffix}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robotsValue} />
      <meta name="googlebot" content={robotsValue} />

      {Object.entries(seoConfig.defaults).map(([key, value]) => (
        <meta key={key} name={key} content={value} />
      ))}

      <meta property="og:title" content={`${title} – ${seoConfig.titleSuffix}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:title" content={`${title} – ${seoConfig.titleSuffix}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {keywords && <meta name="keywords" content={keywords} />}

      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(techArticleJsonLd)}</script>
    </Helmet>
  );
}


