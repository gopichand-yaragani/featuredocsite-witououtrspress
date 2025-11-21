import React, { useMemo } from "react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Calendar, Clock, ArrowRight, Home } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TableOfContents } from "./TableOfContents";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { MDXContent } from "./MDXContent";
import { Seo, PageSeo, BreadcrumbEntry } from "./Seo";
import { resolveMDXPath } from "../utils/mdxPathResolver";
import { getContentEntry } from "../content/contentLoader";

// Admin breadcrumb hierarchy constants (shared across DocumentationContent and DefaultContent)
// Direct array declarations - no extraction or function calls to avoid bundler reordering issues
const organizationalDetailsPages: readonly string[] = ["cost-center", "departments", "members", "designations", "holidays", "locations", "operational-hours", "organizational-details-nested", "organizational-details"];
const departmentsPages: readonly string[] = ["members", "designations", "holidays", "locations", "operational-hours", "organizational-details-nested"];
const discoveryPages: readonly string[] = ["application-map", "client", "discovery-agents", "remote-install", "restart-client", "correlation", "credentials", "details", "backup-file", "flush-credential", "download-application", "import-templates", "ignore-adm-process", "ignore-process", "major-software", "monitoring-profile", "action-details", "frequency", "notifications", "trigger-conditions", "patterns", "port-configuration", "probe-workflow", "probes", "scan-configuration", "sensors"];
const clientPages: readonly string[] = ["discovery-agents", "remote-install", "restart-client"];
const credentialsPages: readonly string[] = ["details", "backup-file", "flush-credential"];
const monitoringProfilePages: readonly string[] = ["action-details", "details", "frequency", "notifications", "trigger-conditions"];
const sacmPages: readonly string[] = ["blueprints", "bsm-views", "cmdb-graphical-workflow", "cmdb-properties", "confidence-configuration", "duplicates-remediation", "export-ci-template", "ip-connection-score-threshold", "process-tags", "property-group", "relationship-types", "software-license-validity-check", "software-usage-report"];
const usersPages: readonly string[] = ["ad-configuration", "azure-ad-configuration", "saml-configuration", "time-track-reports", "user-groups", "user-roles", "users-list"];
const managementFunctionsPages: readonly string[] = ["change-management", "contract-management", "event-management", "hardware-asset-management", "incident-management", "knowledge-management", "problem-management", "about-procurement", "procurement-properties", "procurement-property-group", "project-management", "release-management", "request-management", "vendor-management"];
const procurementPages: readonly string[] = ["procurement-properties", "about-procurement", "procurement-property-group"];
const integrationsPages: readonly string[] = ["cherwell-credential", "cherwell-mappings", "infoblox-configuration", "ivanti-credentials", "ivanti-mappings", "jira-credentials", "jira-asset-mappings", "servicenow-credentials", "servicenow-mappings"];
const cherwellCredentialPages: readonly string[] = ["cherwell-mappings"];
const ivantiCredentialsPages: readonly string[] = ["ivanti-mappings"];
const jiraCredentialsPages: readonly string[] = ["jira-asset-mappings"];
const servicenowCredentialsPages: readonly string[] = ["servicenow-mappings"];
const othersPages: readonly string[] = ["announcements", "business-rules", "custom-reports", "documentation-and-tester", "inbox-configuration-itsm", "kpis", "reports", "role-access", "service-level-agreements", "smtp-configuration", "risk-score-calculator", "graphical-workflows"];

interface DocumentationContentProps {
  version: string;
  module: string;
  section: string;
  page: string;
  currentPath?: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
  onPageClick?: (version: string, module: string, section: string, page: string) => void;
}

const moduleNames: Record<string, string> = {
  admin: "Admin",
  "my-dashboard": "My Dashboard",
  cmdb: "CMDB",
  "discovery-scan": "Discovery Scan",
  itsm: "ITSM",
  "vulnerability-management": "Vulnerability Management",
  itam: "ITAM",
  "self-service": "Self Service",
  "program-project-management":
    "Program and Project Management",
  "risk-register": "Risk Register",
  reports: "Reports",
};

const parentTopicPageMap: Record<string, string> = {
  "Shared Functions": "shared-functions",
  "Dashboards": "dashboards",
  "Manage CMDB": "manage-cmdb",
  "View and Edit a CI": "view-and-edit-ci",
  "CI Details and Tabs": "ci-details-and-tabs",
  "Dashboard": "dashboard",
  "Run a Scan": "run-a-scan",
  "Recent Scans": "recent-scans",
  "Azure AD User Import Logs": "azure-ad-user-import-logs",
  "Scheduled Scans and Imports": "scheduled-scans-and-imports",
  "IPAM Networks": "ipam-networks",
  "Discovered Items": "discovered-items",
  "Import from AWS": "import-from-aws",
  "Import from Azure": "import-from-azure",
  "Import from Meraki": "import-from-meraki",
  "Import from Intune": "import-from-intune",
  "Import Data Files": "import-data-files",
  "Imported Assets": "imported-assets",
  "AD User Import Logs": "ad-user-import-logs",
  "Configuration Management": "configuration-management",
  "CMDB": "cmdb",
  "Details": "details",
  "Other Functions and Page Elements": "other-functions-and-page-elements",
  "Procurement": "procurement",
  "Self Service": "self-service",
  "Program/Project Management": "program-project-management",
  "Programs": "programs",
  "Projects": "projects",
  "Risk Register": "risk-register",
  "Reports": "reports",
  "Organizational Details": "organizational-details",
  "Departments": "departments",
  "Discovery": "discovery",
  "Client": "client",
  "Credentials": "credentials",
  "Monitoring Profile": "monitoring-profile",
  "SACM": "sacm",
  "Users": "users",
  "Management Functions": "management-functions",
  "Integrations": "integrations",
  "Cherwell Credential": "cherwell-credential",
  "Ivanti Credentials": "ivanti-credentials",
  "Jira Credentials": "jira-credentials",
  "ServiceNow Credentials": "servicenow-credentials",
  "Others": "others",
  "My Dashboard": "my-dashboard-section",
  "Initiate and Configure Discovery Scan": "initiate-and-configure-discovery-scan",
  "Configure Discovery Scan": "configure-discovery-scan",
  "View Recent Scan": "view-recent-scan",
  "View Import Log Details": "view-import-log-details",
  "Scans and Import Options": "scans-and-import-options",
  "IPAM Functions Overview": "ipam-functions-overview",
  "Scan Function": "scan-function",
  "Manage Discovered Items": "manage-discovered-items",
  "Detailed View of Discovered Items": "detailed-view-of-discovered-items",
  "Manage Import Data Files": "manage-import-data-files",
  "View an Imported Data File": "view-an-imported-data-file",
  "Vulnerability Management": "vulnerability-management",
};

// Helper function to get section display name
function getSectionDisplayName(section: string): string {
  const sectionNames: Record<string, string> = {
    "getting-started": "Getting Started",
    "application-overview": "Application Overview",
    "organizational-details": "Organizational Details",
    "discovery": "Discovery",
    "sacm": "SACM",
    "users": "Users",
    "management-functions": "Management Functions",
    "integrations": "Integrations",
    "others": "Others",
    "online-help": "OnlineHelp",
    "api-integration": "API Integration",
    "compatibility-matrix": "Compatibility Matrix",
    "release-notes": "Release Notes",
    "manuals": "Manuals",
    "admin": "Admin",
    "cmdb": "CMDB",
    "discovery-scan": "Discovery Scan",
    "itsm": "ITSM",
    "vulnerability-management": "Vulnerability Management",
    "itam": "ITAM",
    "self-service": "Self Service",
    "program-project-management": "Program and Project Management",
    "risk-register": "Risk Register",
    "reports": "Reports",
  };
  return sectionNames[section] || section
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to get parent topic information
function getParentTopic(section: string, page: string): string | null {
  // Shared Functions pages
  const sharedFunctionsPages = [
    "advanced-search", "attachments", "auto-refresh", "collapse-maximize",
    "comments", "copy-to-cherwell", "copy-to-ivanti", "copy-to-servicenow",
    "delete-remove", "email-preferences", "enable-disable-editing", "export",
    "filter-by", "history", "import", "items-per-page", "mark-as-knowledge",
    "other-asset-info", "outage-calendar", "personalize-columns", "print",
    "process-adm", "process-missing-components", "records-per-page",
    "reload-default-mapping", "re-scan", "re-sync-data", "save",
    "saved-filters", "searching", "show-main-all-properties", "tasks",
    "updates", "version-control"
  ];
  
  // CMDB pages
  const manageCmdbPages = [
    "audits", "change-attributes", "delete", "export", "new",
    "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow",
    "generate-installed-software-report", "process-adm",
    "process-available-patch-report", "process-cloud-hierarchy",
    "process-devops", "process-missing-components", "process-network-connection",
    "process-software-installation", "process-network-virtualization-hierarchy"
  ];
  
  const viewEditCiPages = ["ci-left-panel", "contacts-on-ci"];
  
  const ciDetailsPages = [
    "details", "components", "logon-events", "itsm", "relationships",
    "audits-tab", "sla", "maintenance", "vulnerability", "private-properties",
    "tasks", "history", "attachments"
  ];
  
  const detailsNestedPages = ["manage-ci", "business-service-map"];
  
  // Discovery Scan pages
  const dashboardPages = ["access-dashboard", "dashboard-features", "add-contents", "dashboard-customization"];
  const runAScanPages = ["pre-requisites-for-scan", "access-run-a-scan", "probes-configuration", "client-configuration"];
  const recentScansPages = ["access-recent-scan", "export-scan-report", "refresh", "logs", "tasks", "comments", "attachments"];
  const azureAdPages = ["azure-ad-configuration-and-import", "access-the-azure-ad-user-import-logs", "customize-columns", "delete-azure-ad-user-import-logs"];
  // Discovery Scan - additional sections from Flare TOC
  const scheduledScansImportsPages = [
    "prerequisites-scheduled-scans-imports",
    "accessing-scheduled-scan-and-imports",
    "key-features-and-options-on-the-landing-page",
    "scans-and-import-options",
    "scan-and-import-schedule-list",
    "schedule-a-network-scan",
    "editing-a-scheduled-scan",
    "history-of-scheduled-scan-execution",
    "bulk-update-scan",
    "exporting-a-scan",
    "importing-scan-schedule",
    "deleting-a-scan-schedule",
    "scheduled-import-setup",
    "aws-import",
    "azure-import",
    "meraki-import",
  ];
  const scansAndImportOptionsPages = ["scan-and-import-schedule-list"];
  const ipamNetworksPages = [
    "ipam-procedure",
    "infoblox-configuration",
    "ipam-ip-address-management",
    "ipam-functions-overview",
    "scan-function",
    "status-update",
    "regular-scan",
    "sync-instant-and-scheduled",
    "view-and-edit-a-network",
    "other-functions-and-page-elements",
  ];
  const ipamFunctionsOverviewPages = ["scan-function", "status-update", "regular-scan"];
  const scanFunctionPages = ["status-update", "regular-scan"];
  const discoveredItemsPages = [
    "prerequisites-discovered-items",
    "access-discovered-items",
    "manage-discovered-items",
    "delete",
    "export",
    "export-without-selecting-any-record",
    "move-to-cmdb",
    "re-scan",
    "column-descriptions",
    "detailed-view-of-discovered-items",
    "primary-details-block",
    "owner-block",
    "main-information-area",
    "action-buttons",
    "navigation-tabs",
    "other-functions-and-page-elements",
    "toolbar-or-control-bar",
    "filter-by-discovered-items",
  ];
  const importFromAwsPages = [
    "access-the-import-aws-window",
    "import-aws-record",
    "view-aws-import-record",
    "key-columns",
    "move-items-to-cmdb",
    "logs",
    "delete-aws-record",
    "export-aws-records",
    "view-a-discovered-aws-record",
  ];
  const importFromAzurePages = [
    "access-the-import-azure-window",
    "import-azure-record",
    "view-azure-import-record",
    "common-controls",
    "key-columns",
    "move-items-to-the-cmdb",
    "delete-azure-record",
    "export-azure-records",
    "view-a-discovered-azure-record",
    "discovered-item-view-overview",
    "top-right-actions",
    "tabs-main-panel",
  ];
  const importFromMerakiPages = [
    "prerequisites-meraki",
    "assess-import-meraki-window",
    "import-meraki-record",
    "view-meraki-import-record",
    "common-controls",
    "key-columns",
    "move-items-to-the-cmdb",
    "logs",
    "delete-meraki-record",
    "export-meraki-records",
    "view-a-discovered-meraki-record",
    "discovered-item-view-overview",
    "top-right-actions",
    "tabs-main-panel",
  ];
  const importFromIntunePages = [
    "access-import-from-intune",
    "import-intune-record",
    "view-intune-import-record",
    "delete-intune-record",
    "export-intune-records",
    "view-a-discovered-intune-record",
  ];
  const importDataFilesPages = [
    "access-the-import-data-files",
    "manage-import-data-files",
    "import-ci",
    "view-an-imported-data-file",
    "all-tab",
    "authorized-tab",
    "unauthorized-tab",
    "import-asset-ci-relations",
    "delete",
    "export",
  ];
  const importedAssetsPages = [
    "access-the-imported-assets",
    "manage-imported-assets",
    "imported-asset-details",
  ];
  const adUserImportLogsPages = [
    "ad-configuration-and-import",
    "ad-configuration-property-descriptions",
    "testing-ad-configuration",
    "import-users",
    "scheduled-ad-import",
    "access-the-ad-user-import-logs",
    "view-import-log-details",
    "details-tab",
    "tabs-for-extended-information",
    "customize-columns",
  ];
  
  if (section === "application-overview" && sharedFunctionsPages.includes(page)) {
    return "Shared Functions";
  }
  
  if (section === "cmdb") {
    if (manageCmdbPages.includes(page)) return "Manage CMDB";
    if (viewEditCiPages.includes(page)) return "View/Edit CI";
    if (ciDetailsPages.includes(page)) return "CI Details";
    if (detailsNestedPages.includes(page)) return "Details";
  }
  
  if (section === "discovery-scan") {
    if (dashboardPages.includes(page)) return "Dashboard";
    if (runAScanPages.includes(page)) return "Run A Scan";
    if (recentScansPages.includes(page)) return "Recent Scans";
    if (azureAdPages.includes(page)) return "Azure AD";
  }
  
  return null;
}

export function DocumentationContent({
  version,
  module,
  section,
  page,
  currentPath,
  onHomeClick,
  onModuleClick,
  onVersionClick,
  onPageClick,
}: DocumentationContentProps) {
  const moduleName = moduleNames[module] || module;
  
  // Helper function to get page label from page ID (matches TOC structure)
  // This ensures breadcrumb labels match the TOC exactly
  const getPageLabel = (pageId: string): string => {
    // Map of page IDs to their display labels (matching TOC structure)
    const pageLabelMap: Record<string, string> = {
      // Application Overview pages
      "system-icons": "System Icons",
      "user-specific-functions": "User Specific Functions",
      "online-help": "Online Help",
      "shared-functions": "Shared Functions",
      "advanced-search": "Advanced Search",
      "attachments": "Attachments",
      "auto-refresh": "Auto Refresh",
      "collapse-maximize": "Collapse/Maximize",
      "comments": "Comments",
      "copy-to-cherwell": "Copy to Cherwell",
      "copy-to-ivanti": "Copy to Ivanti",
      "copy-to-jira": "Copy to Jira",
      "copy-to-servicenow": "Copy to ServiceNow",
      "delete-remove": "Delete/Remove",
      "email-preferences": "Email Preferences",
      "enable-disable-editing": "Enable/Disable Editing",
      "export": "Export",
      "filter-by": "Filter By",
      "history": "History",
      "import": "Import",
      "items-per-page": "Items per Page",
      "mark-as-knowledge": "Mark as Knowledge",
      "other-asset-info": "Other Asset Info",
      "outage-calendar": "Outage Calendar",
      "personalize-columns": "Personalize Columns",
      "print": "Print",
      "process-adm": "Process ADM",
      "process-missing-components": "Process Missing Components",
      "records-per-page": "Records per Page",
      "reload-default-mapping": "Reload Default Mapping",
      "re-scan": "Re-scan",
      "re-sync-data": "Re-Sync Data",
      "save": "Save",
      "saved-filters": "Saved Filters",
      "searching": "Searching",
      "show-main-all-properties": "Show Main/All Properties",
      "tasks": "Tasks",
      "updates": "Updates",
      "version-control": "Version Control",
      // My Dashboard pages
      "my-dashboard-overview": "Overview",
      "dashboards": "Dashboards",
      "dashboards-contents": "Contents",
      "customization": "Customization",
      "report-actions": "Report Actions",
      "my-dashboard-section": "My Dashboard",
      "my-dashboard-contents": "Contents",
      // Add more mappings as needed - this ensures consistency with TOC
    };
    
    // If we have a label mapping, use it; otherwise format from page ID
    if (pageLabelMap[pageId]) {
      return pageLabelMap[pageId];
    }
    
    // Fallback: format page ID to readable label
    // Ensure CMDB and SACM are always uppercase
    return pageId
      .split("-")
      .map(word => {
        const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
        // Ensure CMDB and SACM are always uppercase
        if (capitalized === "Cmdb") return "CMDB";
        if (capitalized === "Sacm") return "SACM";
        return capitalized;
      })
      .join(" ")
      .replace(/\bCmdb\b/g, "CMDB")
      .replace(/\bSacm\b/g, "SACM");
  };
  
  // Helper function to get parent topic page ID from parent topic name
  const getParentTopicPageId = (parentTopicName: string): string | null => {
    return parentTopicPageMap[parentTopicName] || null;
  };
  
  // Handler for parent topic clicks
  const handleParentTopicClick = (parentTopicName: string) => {
    if (!onPageClick) return;
    const parentPageId = getParentTopicPageId(parentTopicName);
    if (parentPageId) {
      onPageClick(version, module, section, parentPageId);
    }
  };
  
  // Handler for nested topic clicks
  const handleNestedTopicClick = (nestedTopicName: string, nestedPageId: string) => {
    if (!onPageClick) return;
    onPageClick(version, module, section, nestedPageId);
  };
  
  // Helper to create clickable breadcrumb link props for nested topics
  const getClickableBreadcrumbProps = (topicName: string, pageId: string) => ({
    onClick: () => handleNestedTopicClick(topicName, pageId),
    className: "text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors",
  });

  const normalizedPath = currentPath
    ? currentPath.startsWith("/")
      ? currentPath
      : `/${currentPath}`
    : null;

  const resolvedMDXPath = useMemo(() => {
    try {
      return resolveMDXPath({ version, module, section, page });
    } catch (error) {
      console.error("Error resolving MDX path:", error);
      return null;
    }
  }, [version, module, section, page]);

  const contentEntry = useMemo(() => {
    if (!resolvedMDXPath) return null;
    return getContentEntry(resolvedMDXPath);
  }, [resolvedMDXPath]);

  const pageSeo = useMemo<PageSeo | null>(() => {
    if (!contentEntry) return null;
    const data = contentEntry.frontmatter || {};

    const toStringArray = (value: unknown): string[] | undefined => {
      if (Array.isArray(value)) {
        const filtered = value.filter((item): item is string => typeof item === "string");
        return filtered.length ? filtered : undefined;
      }
      if (typeof value === "string") {
        const parts = value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        return parts.length ? parts : undefined;
      }
      return undefined;
    };

    const coerceBoolean = (value: unknown): boolean | undefined => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lowered = value.toLowerCase();
        if (lowered === "true") return true;
        if (lowered === "false") return false;
      }
      return undefined;
    };

    const typedData = data as Record<string, unknown>;

    const seo: PageSeo = {
      title: typeof typedData.title === "string" ? typedData.title : undefined,
      description: typeof typedData.description === "string" ? typedData.description : undefined,
      canonical: typeof typedData.canonical === "string" ? typedData.canonical : undefined,
      keywords: toStringArray(typedData.keywords),
      lastUpdated: typeof typedData.lastUpdated === "string" ? typedData.lastUpdated : undefined,
      ogImage: typeof typedData.ogImage === "string" ? typedData.ogImage : undefined,
      noindex: coerceBoolean(typedData.noindex),
    };

    return seo;
  }, [contentEntry]);

  const pageDisplayNameForSeo = getPageLabel(page);
  const fallbackTitle = pageDisplayNameForSeo || moduleName;
  const fallbackDescription = `${moduleName}${
    pageDisplayNameForSeo ? ` – ${pageDisplayNameForSeo}` : ""
  } documentation for Virima.`;

  const versionLabelMap: Record<string, string> = {
    NextGen: "NextGen",
    "6_1": "6.1",
    "6_1_1": "6.1.1",
    "5_13": "5.13",
  };

  const segmentLabelOverrides: Record<string, string> = {
    "my-dashboard": "My Dashboard",
    "my-dashboard-6_1": "My Dashboard",
    admin: "Admin",
    "admin_6_1": "Admin",
    cmdb: "CMDB",
    "cmdb_6_1": "CMDB",
    "discovery-scan": "Discovery Scan",
    "discovery_scan_6_1": "Discovery Scan",
    itsm: "ITSM",
    itam: "ITAM",
    "itam_6_1": "ITAM",
    "self-service": "Self Service",
    "self-service-6_1": "Self Service",
    "program-project-management": "Program and Project Management",
    "program-project-management-6_1": "Program and Project Management",
    "risk-register": "Risk Register",
    reports: "Reports",
    "reports_6_1": "Reports",
    "vulnerability-management": "Vulnerability Management",
    "vulnerability_management-6_1": "Vulnerability Management",
    NG: "NextGen",
    admin_discovery: "Discovery",
    admin_sacm: "SACM",
    admin_users: "Users",
    admin_change_mngmnt: "Change Management",
    admin_contract_mngmt: "Contract Management",
    admin_event_mngmnt: "Event Management",
    admin_hardware_asset_mngmnt: "Hardware Asset Management",
    admin_incident_mngmnt: "Incident Management",
    admin_knowledge_mngmnt: "Knowledge Management",
    admin_procurement: "Procurement",
    admin_procurement_mngmnt: "Procurement Management",
    admin_project_mngmnt: "Project Management",
    admin_release_mngmnt: "Release Management",
    admin_request_mngmnt: "Request Management",
    admin_vendor_mngmnt: "Vendor Management",
    admin_integrations: "Integrations",
    admin_other: "Other Functions",
    admin_org_details: "Organizational Details",
  };

  const toTitleCase = (value: string) =>
    value
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ")
      .replace(/\bCmdb\b/g, "CMDB")
      .replace(/\bItsm\b/g, "ITSM")
      .replace(/\bItam\b/g, "ITAM");

  const formatSegmentLabel = (segment: string): string => {
    if (!segment) return "";
    if (versionLabelMap[segment]) return versionLabelMap[segment];
    if (segmentLabelOverrides[segment]) return segmentLabelOverrides[segment];

    const normalizedModule = module.replace(/[-_]/g, "");
    if (segment.replace(/[-_]/g, "") === normalizedModule) {
      return moduleName;
    }

    const withoutVersion = segment.replace(/[-_](6_1_1|6_1|5_13)$/i, "");
    const strippedAdmin = withoutVersion.replace(/^admin[-_]/i, "");
    const normalized = strippedAdmin.replace(/[-_]/g, " ");
    return toTitleCase(normalized);
  };

  const seoBreadcrumbs = useMemo<BreadcrumbEntry[]>(() => {
    if (!normalizedPath) return [];
    const trimmed = normalizedPath.replace(/\/+$/, "");
    if (!trimmed || trimmed === "/") return [];

    const segments = trimmed.slice(1).split("/");
    if (segments.length <= 1) return [];

    const items: BreadcrumbEntry[] = [];
    let accumulated = "";
    for (let i = 0; i < segments.length - 1; i += 1) {
      const segment = segments[i];
      accumulated += `/${segment}`;
      items.push({
        label: formatSegmentLabel(segment),
        path: accumulated,
      });
    }
    return items;
  }, [normalizedPath, module, moduleName]);

  const getTOCItems = () => {
    const contentKey = `${section}-${page}`;

    // Define TOC items based on page content
    const tocMap: Record<
      string,
      Array<{ id: string; text: string; level: number }>
    > = {
      "online-help-overview": [
        {
          id: "key-capabilities",
          text: "Key Capabilities",
          level: 2,
        },
        {
          id: "getting-started",
          text: "Getting Started",
          level: 2,
        },
        {
          id: "whats-new",
          text: `What's New in Version ${version}`,
          level: 2,
        },
      ],
      "release-notes-latest-release": [
        { id: "new-features", text: "New Features", level: 2 },
        { id: "improvements", text: "Improvements", level: 2 },
        { id: "bug-fixes", text: "Bug Fixes", level: 2 },
      ],
      "getting-started-quick-start": [
        {
          id: "prerequisites",
          text: "Prerequisites",
          level: 2,
        },
        {
          id: "quick-start-steps",
          text: "Quick Start Steps",
          level: 2,
        },
        { id: "next-steps", text: "Next Steps", level: 2 },
      ],
      "api-integration-api-overview": [
        {
          id: "api-endpoints",
          text: "API Endpoints",
          level: 2,
        },
        {
          id: "authentication",
          text: "Authentication",
          level: 2,
        },
        {
          id: "response-format",
          text: "Response Format",
          level: 2,
        },
      ],
      "compatibility-matrix-system-requirements": [
        {
          id: "browser-compatibility",
          text: "Browser Compatibility",
          level: 2,
        },
        {
          id: "user-permissions",
          text: "User Permissions",
          level: 2,
        },
        {
          id: "integration-dependencies",
          text: "Integration Dependencies",
          level: 2,
        },
      ],
    };

    return (
      tocMap[contentKey] || [
        { id: "overview", text: "Overview", level: 2 },
        { id: "key-topics", text: "Key Topics", level: 2 },
        {
          id: "example-configuration",
          text: "Example Configuration",
          level: 2,
        },
        {
          id: "additional-resources",
          text: "Additional Resources",
          level: 2,
        },
      ]
    );
  };

  // Comprehensive breadcrumb rendering function (shared across all content types)
  // This uses the same complete hierarchy logic as DefaultContent
  const renderBreadcrumbs = () => {
    // Import all hierarchy arrays and logic from DefaultContent
    // My Dashboard - Application Overview hierarchy
    const sharedFunctionsPages = [
      "advanced-search", "attachments", "auto-refresh", "collapse-maximize",
      "comments", "copy-to-cherwell", "copy-to-ivanti", "copy-to-servicenow",
      "delete-remove", "email-preferences", "enable-disable-editing", "export",
      "filter-by", "history", "import", "items-per-page", "mark-as-knowledge",
      "other-asset-info", "outage-calendar", "personalize-columns", "print",
      "process-adm", "process-missing-components", "records-per-page",
      "reload-default-mapping", "re-scan", "re-sync-data", "save",
      "saved-filters", "searching", "show-main-all-properties", "tasks",
      "updates", "version-control", "go-to-page", "send-report-to"
    ];
    
    // My Dashboard - My Dashboard section hierarchy
    const dashboardsPages = ["contents", "customization", "report-actions", "my-dashboard-section"];
    const myDashboardSectionPages = ["contents"];
    
    // CMDB breadcrumb hierarchy
    const manageCmdbPages = [
      "audits", "change-attributes", "delete", "export", "new",
      "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow",
      "generate-installed-software-report", "process-adm",
      "process-available-patch-report", "process-cloud-hierarchy",
      "process-devops", "process-missing-components", "process-network-connection",
      "process-software-installation", "process-network-virtualization-hierarchy"
    ];
    
    const viewEditCiPages = ["ci-left-panel", "contacts-on-ci"];
    
    const ciDetailsPages = [
      "details", "components", "logon-events", "itsm", "relationships",
      "audits-tab", "sla", "maintenance", "vulnerability", "private-properties",
      "tasks", "history", "attachments"
    ];
    
    const detailsNestedPages = ["manage-ci", "business-service-map"];
    
    // Discovery Scan breadcrumb hierarchy
    const dashboardPages = ["access-dashboard", "dashboard-features", "add-contents", "dashboard-customization"];
    
    const runAScanPages = ["pre-requisites-for-scan", "access-run-a-scan", "initiate-and-configure-discovery-scan", "configure-discovery-scan", "probes-configuration", "client-configuration"];
    const initiateConfigurePages = ["access-run-a-scan", "configure-discovery-scan", "probes-configuration", "client-configuration"];
    const configureDiscoveryPages = ["probes-configuration", "client-configuration"];
    
    const recentScansPages = ["access-recent-scan", "view-recent-scan", "details", "export-scan-report", "refresh", "logs", "tasks", "comments", "attachments"];
    const viewRecentScanPages = ["details", "export-scan-report", "refresh", "logs", "tasks", "comments", "attachments"];
    const recentScanDetailsPages = ["export-scan-report", "refresh"];
    
    const azureAdPages = [
      "azure-ad-configuration-and-import",
      "azure-ad-configuration-property-descriptions",
      "testing-ad-configuration-azure",
      "import-users-azure",
      "scheduled-azure-ad-import",
      "access-the-azure-ad-user-import-logs",
      "view-import-log-details-azure",
      "details-tab-azure",
      "key-information-displayed",
      "tabs-for-extended-information-azure",
      "customize-columns-azure",
    ];
    const azureAdConfigurationAndImportPages = [
      "azure-ad-configuration-property-descriptions",
      "testing-ad-configuration-azure",
      "import-users-azure",
      "scheduled-azure-ad-import",
    ];
    const viewImportLogDetailsAzurePages = [
      "details-tab-azure",
      "key-information-displayed",
      "tabs-for-extended-information-azure",
      "customize-columns-azure",
    ];
    
    const scheduledScansImportsPages = [
      "prerequisites",
      "accessing-scheduled-scan-and-imports",
      "key-features-and-options-on-the-landing-page",
      "scans-and-import-options",
      "scan-and-import-schedule-list",
      "schedule-a-network-scan",
      "editing-a-scheduled-scan",
      "history-of-scheduled-scan-execution",
      "bulk-update-scan",
      "exporting-a-scan",
      "importing-scan-schedules",
      "deleting-a-scan-schedule",
      "scheduled-import-setup",
      "aws-import",
      "azure-import",
    ];
    const scansAndImportOptionsPages = [
      "scan-and-import-schedule-list",
      "schedule-a-network-scan",
      "editing-a-scheduled-scan",
      "history-of-scheduled-scan-execution",
      "bulk-update-scan",
      "exporting-a-scan",
      "importing-scan-schedules",
      "deleting-a-scan-schedule",
    ];
    const scheduledImportSetupPages = ["aws-import", "azure-import"];
    const ipamNetworksPages = [
      "ipam-procedure",
      "infoblox-configuration",
      "ipam-ip-address-management",
      "ipam-functions-overview",
      "scan-function",
      "status-update",
      "regular-scan",
      "sync-instant-and-scheduled",
      "view-and-edit-a-network",
      "other-functions-and-page-elements-ipam",
    ];
    const ipamFunctionsOverviewPages = [
      "scan-function",
      "status-update",
      "regular-scan",
      "sync-instant-and-scheduled",
      "view-and-edit-a-network",
      "other-functions-and-page-elements-ipam",
    ];
    const scanFunctionPages = ["status-update", "regular-scan"];
    const discoveredItemsPages = [
      "prerequisites-discovered-items",
      "access-discovered-items",
      "manage-discovered-items",
      "delete-discovered-items",
      "export-discovered-items",
      "export-without-selecting-any-record",
      "move-to-cmdb",
      "re-scan",
      "column-descriptions",
      "detailed-view-of-discovered-items",
      "primary-details-block",
      "owner-block",
      "main-information-area",
      "action-buttons",
      "navigation-tabs",
      "other-functions-and-page-elements-discovered-items",
      "toolbar-or-control-bar",
      "filter-by",
    ];
    const manageDiscoveredItemsPages = [
      "delete-discovered-items",
      "export-discovered-items",
      "export-without-selecting-any-record",
      "move-to-cmdb",
      "re-scan",
    ];
    const detailedViewDiscoveredItemsPages = [
      "primary-details-block",
      "owner-block",
      "main-information-area",
      "action-buttons",
      "navigation-tabs",
      "other-functions-and-page-elements-discovered-items",
    ];
    const otherFunctionsDiscoveredItemsPages = ["toolbar-or-control-bar", "filter-by"];
    const importFromAwsPages = [
      "access-the-import-aws-window",
      "import-aws-record",
      "view-aws-import-record",
      "key-columns-aws",
      "move-items-to-cmdb-aws",
      "logs-aws",
      "delete-aws-record",
      "export-aws-records",
      "view-a-discovered-aws-record",
    ];
    const viewAwsImportRecordPages = ["key-columns-aws", "move-items-to-cmdb-aws", "logs-aws"];
    const importFromAzurePages = [
      "access-import-azure-window",
      "import-azure-record",
      "view-azure-import-record",
      "common-controls-azure",
      "key-columns-azure",
      "move-items-to-the-cmdb-azure",
      "delete-azure-record",
      "export-azure-records",
      "view-a-discovered-azure-record",
      "discovered-item-view-overview-azure",
      "top-right-actions-azure",
      "tabs-main-panel-azure",
    ];
    const viewAzureImportRecordPages = [
      "common-controls-azure",
      "key-columns-azure",
      "move-items-to-the-cmdb-azure",
      "delete-azure-record",
      "export-azure-records",
      "view-a-discovered-azure-record",
      "discovered-item-view-overview-azure",
      "top-right-actions-azure",
      "tabs-main-panel-azure",
    ];
    const importFromMerakiPages = [
      "prerequisites-meraki",
      "assess-import-meraki-window",
      "import-meraki-record",
      "view-meraki-import-record",
      "common-controls-meraki",
      "key-columns-meraki",
      "move-items-to-the-cmdb-meraki",
      "logs-meraki",
      "delete-meraki-record",
      "export-meraki-records",
      "view-a-discovered-meraki-record",
      "discovered-item-view-overview-meraki",
      "top-right-actions-meraki",
      "tabs-main-panel-meraki",
    ];
    const viewMerakiImportRecordPages = [
      "common-controls-meraki",
      "key-columns-meraki",
      "move-items-to-the-cmdb-meraki",
      "logs-meraki",
      "delete-meraki-record",
      "export-meraki-records",
      "view-a-discovered-meraki-record",
      "discovered-item-view-overview-meraki",
      "top-right-actions-meraki",
      "tabs-main-panel-meraki",
    ];
    const importFromIntunePages = [
      "access-import-from-intune",
      "import-intune-record",
      "view-intune-import-record",
      "delete-intune-record",
      "export-intune-records",
      "view-a-discovered-intune-record",
    ];
    const viewIntuneImportRecordPages = [
      "delete-intune-record",
      "export-intune-records",
      "view-a-discovered-intune-record",
    ];
    const importDataFilesPages = [
      "access-the-import-data-files",
      "manage-import-data-files",
      "import-ci",
      "view-an-imported-data-file",
      "all-tab",
      "authorized-tab",
      "unauthorized-tab",
      "import-asset-ci-relations",
      "delete-import-data-files",
      "export-import-data-files",
    ];
    const viewImportedDataFilePages = ["all-tab", "authorized-tab", "unauthorized-tab"];
    const importedAssetsPages = [
      "access-the-imported-assets",
      "manage-imported-assets",
      "imported-asset-details",
    ];
    const adUserImportLogsPages = [
      "ad-configuration-and-import",
      "ad-configuration-property-descriptions",
      "testing-ad-configuration",
      "import-users",
      "scheduled-ad-import",
      "access-the-ad-user-import-logs",
      "view-import-log-details",
      "details-tab",
      "tabs-for-extended-information",
      "customize-columns",
    ];
    const adConfigurationAndImportPages = [
      "ad-configuration-property-descriptions",
      "testing-ad-configuration",
      "import-users",
      "scheduled-ad-import",
    ];
    const viewImportLogDetailsPages = ["details-tab", "tabs-for-extended-information", "customize-columns"];
    
    // ITSM breadcrumb hierarchy
    const configurationManagementPages = ["dashboard", "cmdb", "access-cmdb", "manage-cmdb", "view-and-edit-ci", "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
    
    const itsmCmdbPages = ["access-cmdb", "manage-cmdb", "view-and-edit-ci", "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
    
    const itsmManageCmdbPages = ["audits", "change-attributes", "delete", "export", "new", "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow", "generate-installed-software-report", "process-adm", "process-available-patch-report", "process-cloud-hierarchy", "process-devops", "process-missing-components", "process-network-connection", "process-software-installation"];
    
    const itsmViewEditCiPages = ["ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
    
    const itsmCiDetailsPages = ["details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments"];
    
    const itsmDetailsNestedPages = ["manage-ci", "business-service-map"];
    
    const itsmOtherFunctionsPages = ["sync-logs", "tags", "audits"];
    
    // ITAM breadcrumb hierarchy
    const itamConfigurationManagementPages = [
      "dashboard", "cmdb", "access-cmdb", "manage-cmdb",
      "view-and-edit-ci", "ci-details-and-tabs",
      "other-functions-and-page-elements"
    ];
    const itamCmdbPages = [
      "access-cmdb", "manage-cmdb", "view-and-edit-ci",
      "ci-details-and-tabs", "other-functions-and-page-elements"
    ];
    const itamManageCmdbPages = [
      "audits", "change-attributes", "delete", "export", "new",
      "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow",
      "generate-installed-software-report", "process-adm",
      "process-available-patch-report", "process-cloud-hierarchy",
      "process-devops", "process-missing-components",
      "process-network-connection", "process-software-installation",
      "process-network-virtualization-hierarchy"
    ];
    const itamViewEditCiPages = [
      "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details",
      "manage-ci", "business-service-map", "components", "logon-events",
      "itsm", "relationships", "audits-tab", "sla", "maintenance",
      "vulnerability", "private-properties", "tasks", "history",
      "attachments", "comments"
    ];
    const itamCiDetailsPages = [
      "details", "manage-ci", "business-service-map", "components",
      "logon-events", "itsm", "relationships", "audits-tab", "sla",
      "maintenance", "vulnerability", "private-properties", "tasks",
      "history", "attachments", "comments"
    ];
    const itamDetailsNestedPages = [
      "manage-ci", "business-service-map", "components", "logon-events",
      "itsm", "relationships", "audits-tab", "sla", "maintenance",
      "vulnerability", "private-properties", "tasks", "history",
      "attachments", "comments"
    ];
    const itamOtherFunctionsPages = ["sync-logs", "tags", "audits"];
    const itamProcurementPages = [
      "requested-items", "purchase-orders", "purchase-order-line-items",
      "receiving-slips", "receiving-slip-lines", "transfer-order"
    ];
    
    
    
    
    
    // Self Service breadcrumb hierarchy
    const selfServicePages = ["service-catalog", "my-incidents", "my-requests"];
    
    // Program/Project Management breadcrumb hierarchy
    const programProjectManagementPages = ["programs", "projects", "program-dashboard", "project-dashboard"];
    const programsPages = ["program-dashboard"];
    const projectsPages = ["project-dashboard"];
    
    // Risk Register breadcrumb hierarchy
    const riskRegisterPages = ["risk-dashboard", "risks"];
    
    // Reports breadcrumb hierarchy
    const reportsPages = ["ad-hoc-reports", "canned-reports", "properties-and-conditions", "run-report", "delete-report"];
    
    // Vulnerability Management breadcrumb hierarchy
    const vulnerabilityManagementPages = ["core-functionality", "access-vulnerability-management", "view-vulnerability-management", "best-practices", "limitations-and-considerations"];
    
    // Admin breadcrumb hierarchy (using module-level constants declared above)
    
    // Application Overview pages (these appear under Application Overview section in my-dashboard module)
    const applicationOverviewPages = [
      "system-icons",
      "user-specific-functions", 
      "online-help",
      ...sharedFunctionsPages,
      "shared-functions" // parent page itself
    ];
    
    // Getting Started pages (universal: works for all modules and versions)
    const gettingStartedPages = ["quick-start", "installation", "configuration", "first-steps"];
    const isGettingStartedPage = gettingStartedPages.includes(page);
    
    // Detect if we're in Application Overview section based on page content
    // Even if URL section is "my-dashboard", if page is an Application Overview page, 
    // we should treat it as "application-overview" for breadcrumb and routing purposes
    const isApplicationOverviewPage = applicationOverviewPages.includes(page);
    
    // Detect actual section: prioritize Getting Started, then Application Overview, then use provided section
    let actualSection = section;
    if (module === 'my-dashboard' && isGettingStartedPage) {
      actualSection = 'getting-started';
    } else if (module === 'my-dashboard' && isApplicationOverviewPage) {
      actualSection = 'application-overview';
    }
    
    // Calculate all hierarchy checks using actualSection
    const isUnderSharedFunctions = actualSection === "application-overview" && (sharedFunctionsPages.includes(page) || page === "shared-functions");
    const isApplicationOverviewDirectPage = actualSection === "application-overview" && (page === "system-icons" || page === "user-specific-functions" || page === "online-help");
    const isUnderDashboards = section === "my-dashboard" && (dashboardsPages.includes(page) || page === "dashboards");
    const isUnderMyDashboardSection = section === "my-dashboard" && (myDashboardSectionPages.includes(page) && page !== "contents") || page === "my-dashboard-section";
    
    const isUnderManageCmdb = section === "cmdb" && (manageCmdbPages.includes(page) || page === "manage-cmdb");
    const isUnderViewEditCi = section === "cmdb" && (viewEditCiPages.includes(page) || page === "view-and-edit-ci");
    const isUnderCiDetails = section === "cmdb" && (ciDetailsPages.includes(page) || page === "ci-details-and-tabs");
    const isUnderDetailsNested = section === "cmdb" && (detailsNestedPages.includes(page) || page === "details");
    
    const isUnderDashboard = section === "discovery-scan" && (dashboardPages.includes(page) || page === "dashboard");
    const isUnderRunAScan = section === "discovery-scan" && runAScanPages.includes(page);
    const isUnderInitiateConfigure = section === "discovery-scan" && (initiateConfigurePages.includes(page) || page === "initiate-and-configure-discovery-scan");
    const isUnderConfigureDiscovery = section === "discovery-scan" && (configureDiscoveryPages.includes(page) || page === "configure-discovery-scan");
    const isUnderRecentScans = section === "discovery-scan" && (recentScansPages.includes(page) || page === "recent-scans");
    const isUnderViewRecentScan = section === "discovery-scan" && (viewRecentScanPages.includes(page) || page === "view-recent-scan");
    const isUnderRecentScanDetails = section === "discovery-scan" && (recentScanDetailsPages.includes(page) || page === "details");
    const isUnderScheduledScansImports = section === "discovery-scan" && (scheduledScansImportsPages.includes(page) || page === "scheduled-scans-and-imports");
    const isUnderScansImportOptions = section === "discovery-scan" && (scansAndImportOptionsPages.includes(page) || page === "scans-and-import-options");
    const isUnderScheduledImportSetup = section === "discovery-scan" && (scheduledImportSetupPages.includes(page) || page === "scheduled-import-setup");
    const isUnderIpamNetworks = section === "discovery-scan" && (ipamNetworksPages.includes(page) || page === "ipam-networks");
    const isUnderIpamFunctionsOverview = section === "discovery-scan" && (ipamFunctionsOverviewPages.includes(page) || page === "ipam-functions-overview");
    const isUnderScanFunction = section === "discovery-scan" && (scanFunctionPages.includes(page) || page === "scan-function");
    const isUnderDiscoveredItems = section === "discovery-scan" && (discoveredItemsPages.includes(page) || page === "discovered-items");
    const isUnderManageDiscoveredItems = section === "discovery-scan" && (manageDiscoveredItemsPages.includes(page) || page === "manage-discovered-items");
    const isUnderDetailedViewDiscoveredItems = section === "discovery-scan" && (detailedViewDiscoveredItemsPages.includes(page) || page === "detailed-view-of-discovered-items");
    const isUnderOtherFunctionsDiscoveredItems = section === "discovery-scan" && (otherFunctionsDiscoveredItemsPages.includes(page) || page === "other-functions-and-page-elements-discovered-items");
    const isUnderImportFromAWS = section === "discovery-scan" && (importFromAwsPages.includes(page) || page === "import-from-aws");
    const isUnderViewAwsImportRecord = section === "discovery-scan" && (viewAwsImportRecordPages.includes(page) || page === "view-aws-import-record");
    const isUnderImportFromAzure = section === "discovery-scan" && (importFromAzurePages.includes(page) || page === "import-from-azure");
    const isUnderViewAzureImportRecord = section === "discovery-scan" && (viewAzureImportRecordPages.includes(page) || page === "view-azure-import-record");
    const isUnderImportFromMeraki = section === "discovery-scan" && (importFromMerakiPages.includes(page) || page === "import-from-meraki");
    const isUnderViewMerakiImportRecord = section === "discovery-scan" && (viewMerakiImportRecordPages.includes(page) || page === "view-meraki-import-record");
    const isUnderImportFromIntune = section === "discovery-scan" && (importFromIntunePages.includes(page) || page === "import-from-intune");
    const isUnderViewIntuneImportRecord = section === "discovery-scan" && (viewIntuneImportRecordPages.includes(page) || page === "view-intune-import-record");
    const isUnderImportDataFiles = section === "discovery-scan" && (importDataFilesPages.includes(page) || page === "import-data-files");
    const isUnderViewImportedDataFile = section === "discovery-scan" && (viewImportedDataFilePages.includes(page) || page === "view-an-imported-data-file");
    const isUnderImportedAssets = section === "discovery-scan" && (importedAssetsPages.includes(page) || page === "imported-assets");
    const isUnderAdUserImportLogs = section === "discovery-scan" && (adUserImportLogsPages.includes(page) || page === "ad-user-import-logs");
    const isUnderAdConfigurationAndImport = section === "discovery-scan" && (adConfigurationAndImportPages.includes(page) || page === "ad-configuration-and-import");
    const isUnderViewImportLogDetails = section === "discovery-scan" && (viewImportLogDetailsPages.includes(page) || page === "view-import-log-details");
    const isUnderAzureAd = section === "discovery-scan" && (azureAdPages.includes(page) || page === "azure-ad-user-import-logs");
    const isUnderAzureAdConfigurationAndImport = section === "discovery-scan" && (azureAdConfigurationAndImportPages.includes(page) || page === "azure-ad-configuration-and-import");
    const isUnderViewImportLogDetailsAzure = section === "discovery-scan" && (viewImportLogDetailsAzurePages.includes(page) || page === "view-import-log-details-azure");
    
    // ITSM hierarchy checks
    const isUnderConfigurationManagement = section === "itsm" && (configurationManagementPages.includes(page) || page === "configuration-management");
    const isUnderItsmCmdb = section === "itsm" && (itsmCmdbPages.includes(page) || page === "cmdb");
    const isUnderItsmManageCmdb = section === "itsm" && (itsmManageCmdbPages.includes(page) || page === "manage-cmdb");
    const isUnderItsmViewEditCi = section === "itsm" && (itsmViewEditCiPages.includes(page) || page === "view-and-edit-ci");
    const isUnderItsmCiDetails = section === "itsm" && (itsmCiDetailsPages.includes(page) || page === "ci-details-and-tabs");
    const isUnderItsmDetailsNested = section === "itsm" && (itsmDetailsNestedPages.includes(page) || page === "details");
    const isUnderItsmOtherFunctions = section === "itsm" && (itsmOtherFunctionsPages.includes(page) || page === "other-functions-and-page-elements");
    
    // ITAM hierarchy checks
    const isUnderItamCmdb = section === "itam" && (itamCmdbPages.includes(page) || page === "cmdb");
    const isUnderItamManageCmdb = section === "itam" && (itamManageCmdbPages.includes(page) || page === "manage-cmdb");
    const isUnderItamViewEditCi = section === "itam" && (itamViewEditCiPages.includes(page) || page === "view-and-edit-ci");
    const isUnderItamCiDetails = section === "itam" && (itamCiDetailsPages.includes(page) || page === "ci-details-and-tabs");
    const isUnderItamDetailsNested = section === "itam" && (itamDetailsNestedPages.includes(page) || page === "details");
    const isUnderItamOtherFunctions = section === "itam" && (itamOtherFunctionsPages.includes(page) || page === "other-functions-and-page-elements");
    const isUnderItamProcurement = section === "itam" && (itamProcurementPages.includes(page) || page === "procurement");
    
    // Self Service hierarchy checks
    const isUnderSelfService = section === "self-service" && (selfServicePages.includes(page) || page === "self-service");
    
    // Program/Project Management hierarchy checks
    const isUnderProgramProjectManagement = section === "program-project-management" && (programProjectManagementPages.includes(page) || page === "program-project-management");
    const isUnderPrograms = section === "program-project-management" && (programsPages.includes(page) || page === "programs");
    const isUnderProjects = section === "program-project-management" && (projectsPages.includes(page) || page === "projects");
    
    // Risk Register hierarchy checks
    const isUnderRiskRegister = section === "risk-register" && (riskRegisterPages.includes(page) || page === "risk-register");
    
    // Reports hierarchy checks
    const isUnderReports = section === "reports" && (reportsPages.includes(page) || page === "reports");
    
    // Vulnerability Management hierarchy checks
    const isUnderVulnerabilityManagement = section === "vulnerability-management" && (vulnerabilityManagementPages.includes(page) || page === "vulnerability-management");
    
    // Admin hierarchy checks
    const isUnderOrganizationalDetails = section === "admin" && (organizationalDetailsPages.includes(page) || page === "organizational-details");
    const isUnderDepartments = section === "admin" && (departmentsPages.includes(page) || page === "departments");
    
    const isUnderDiscovery = section === "admin" && (discoveryPages.includes(page) || page === "discovery");
    const isUnderClient = section === "admin" && (clientPages.includes(page) || page === "client");
    const isUnderCredentials = section === "admin" && (credentialsPages.includes(page) || page === "credentials");
    const isUnderMonitoringProfile = section === "admin" && (monitoringProfilePages.includes(page) || page === "monitoring-profile");
    
    const isUnderSacm = (actualSection === "sacm" || section === "admin") && (sacmPages.includes(page) || page === "sacm");
    const isUnderUsers = section === "admin" && (usersPages.includes(page) || page === "users");
    
    const isUnderManagementFunctions = section === "admin" && (managementFunctionsPages.includes(page) || page === "management-functions");
    const isUnderProcurement = section === "admin" && (procurementPages.includes(page) || page === "procurement");
    
    const isUnderIntegrations = section === "admin" && (integrationsPages.includes(page) || page === "integrations");
    const isUnderCherwellCredential = section === "admin" && (cherwellCredentialPages.includes(page) || page === "cherwell-credential");
    const isUnderIvantiCredentials = section === "admin" && (ivantiCredentialsPages.includes(page) || page === "ivanti-credentials");
    const isUnderJiraCredentials = section === "admin" && (jiraCredentialsPages.includes(page) || page === "jira-credentials");
    const isUnderServicenowCredentials = section === "admin" && (servicenowCredentialsPages.includes(page) || page === "servicenow-credentials");
    const isUnderOthers = section === "admin" && (othersPages.includes(page) || page === "others");
    
    // Get section display name based on actual section
    const sectionDisplayName = getSectionDisplayName(actualSection);
    
    // Determine parent topic to show after section
    // Important: Only set parentTopic if we're NOT on the parent page itself
    let parentTopic: string | null = null;
    if (isUnderSharedFunctions && page !== "shared-functions") parentTopic = "Shared Functions";
    else if (isUnderDashboards && page !== "dashboards") parentTopic = "Dashboards";
    else if (isUnderManageCmdb && page !== "manage-cmdb") parentTopic = "Manage CMDB";
    else if (isUnderViewEditCi && page !== "view-and-edit-ci") parentTopic = "View and Edit a CI";
    else if (isUnderCiDetails || isUnderDetailsNested) parentTopic = "CI Details and Tabs";
    else if (isUnderDashboard && page !== "dashboard") parentTopic = "Dashboard";
    else if (isUnderRunAScan && page !== "run-a-scan") parentTopic = "Run a Scan";
    else if (isUnderInitiateConfigure && page !== "initiate-and-configure-discovery-scan") parentTopic = "Initiate and Configure Discovery Scan";
    else if (isUnderConfigureDiscovery && page !== "configure-discovery-scan") parentTopic = "Configure Discovery Scan";
    else if (isUnderRecentScans && page !== "recent-scans") parentTopic = "Recent Scans";
    else if (isUnderViewRecentScan && page !== "view-recent-scan") parentTopic = "View Recent Scan";
    else if (isUnderRecentScanDetails && page !== "details") parentTopic = "Details";
    else if (isUnderScheduledScansImports && page !== "scheduled-scans-and-imports") parentTopic = "Scheduled Scans and Imports";
    else if (isUnderScansImportOptions && page !== "scans-and-import-options") parentTopic = "Scans and Import Options";
    else if (isUnderScheduledImportSetup && page !== "scheduled-import-setup") parentTopic = "Scheduled Import Setup";
    else if (isUnderIpamNetworks && page !== "ipam-networks") parentTopic = "IPAM Networks";
    else if (isUnderIpamFunctionsOverview && page !== "ipam-functions-overview") parentTopic = "IPAM Functions Overview";
    else if (isUnderScanFunction && page !== "scan-function") parentTopic = "Scan Function";
    else if (isUnderDiscoveredItems && page !== "discovered-items") parentTopic = "Discovered Items";
    else if (isUnderManageDiscoveredItems && page !== "manage-discovered-items") parentTopic = "Manage Discovered Items";
    else if (isUnderDetailedViewDiscoveredItems && page !== "detailed-view-of-discovered-items") parentTopic = "Detailed View of Discovered Items";
    else if (isUnderOtherFunctionsDiscoveredItems && page !== "other-functions-and-page-elements-discovered-items") parentTopic = "Other Functions and Page Elements";
    else if (isUnderImportFromAWS && page !== "import-from-aws") parentTopic = "Import from AWS";
    else if (isUnderViewAwsImportRecord && page !== "view-aws-import-record") parentTopic = "View AWS Import Record";
    else if (isUnderImportFromAzure && page !== "import-from-azure") parentTopic = "Import from Azure";
    else if (isUnderViewAzureImportRecord && page !== "view-azure-import-record") parentTopic = "View AZURE Import Record";
    else if (isUnderImportFromMeraki && page !== "import-from-meraki") parentTopic = "Import from Meraki";
    else if (isUnderViewMerakiImportRecord && page !== "view-meraki-import-record") parentTopic = "View Meraki Import Record";
    else if (isUnderImportFromIntune && page !== "import-from-intune") parentTopic = "Import from Intune";
    else if (isUnderViewIntuneImportRecord && page !== "view-intune-import-record") parentTopic = "View Intune Import Record";
    else if (isUnderImportDataFiles && page !== "import-data-files") parentTopic = "Import Data Files";
    else if (isUnderViewImportedDataFile && page !== "view-an-imported-data-file") parentTopic = "View an Imported Data File";
    else if (isUnderImportedAssets && page !== "imported-assets") parentTopic = "Imported Assets";
    else if (isUnderAdUserImportLogs && page !== "ad-user-import-logs") parentTopic = "AD User Import Logs";
    else if (isUnderAdConfigurationAndImport && page !== "ad-configuration-and-import") parentTopic = "AD Configuration and Import";
    else if (isUnderViewImportLogDetails && page !== "view-import-log-details") parentTopic = "View Import Log Details";
    else if (isUnderAzureAd && page !== "azure-ad-user-import-logs") parentTopic = "Azure AD User Import Logs";
    else if (isUnderAzureAdConfigurationAndImport && page !== "azure-ad-configuration-and-import") parentTopic = "Azure AD Configuration and Import";
    else if (isUnderViewImportLogDetailsAzure && page !== "view-import-log-details-azure") parentTopic = "View Import Log Details";
    else if (isUnderConfigurationManagement && page !== "configuration-management") parentTopic = "Configuration Management";
    else if (isUnderItsmCmdb && page !== "cmdb") parentTopic = "CMDB";
    else if (isUnderItsmManageCmdb && page !== "manage-cmdb") parentTopic = "Manage CMDB";
    else if (isUnderItsmViewEditCi && page !== "view-and-edit-ci") parentTopic = "View and Edit a CI";
    else if (isUnderItsmCiDetails || isUnderItsmDetailsNested) parentTopic = "CI Details and Tabs";
    else if (isUnderItsmDetailsNested && page !== "details") parentTopic = "Details";
    else if (isUnderItsmOtherFunctions && page !== "other-functions-and-page-elements") parentTopic = "Other Functions and Page Elements";
    else if ((section === "itam" && (itamConfigurationManagementPages.includes(page) || page === "configuration-management")) && page !== "configuration-management") parentTopic = "Configuration Management";
    else if (isUnderItamCmdb && page !== "cmdb") parentTopic = "CMDB";
    else if (isUnderItamManageCmdb && page !== "manage-cmdb") parentTopic = "Manage CMDB";
    else if (isUnderItamViewEditCi && page !== "view-and-edit-ci" && !isUnderItamCiDetails && !isUnderItamOtherFunctions) parentTopic = "View and Edit a CI";
    else if (isUnderItamCiDetails || isUnderItamDetailsNested) parentTopic = "CI Details and Tabs";
    else if (isUnderItamDetailsNested && page !== "details") parentTopic = "Details";
    else if (isUnderItamOtherFunctions && page !== "other-functions-and-page-elements") parentTopic = "Other Functions and Page Elements";
    else if (isUnderItamProcurement && page !== "procurement") parentTopic = "Procurement";
    else if ((section === "self-service" && (["service-catalog", "my-incidents", "my-requests"].includes(page) || page === "self-service")) && page !== "self-service") parentTopic = "Self Service";
    else if (((section === "program-project-management") && (["programs","projects","program-dashboard","project-dashboard"].includes(page) || page === "program-project-management")) && page !== "program-project-management") parentTopic = "Program/Project Management";
    else if (isUnderRiskRegister && page !== "risk-register") parentTopic = "Risk Register";
    else if (isUnderReports && page !== "reports") parentTopic = "Reports";
    else if (isUnderOrganizationalDetails && page !== "organizational-details" && !isUnderDepartments) parentTopic = "Organizational Details";
    else if (isUnderDepartments && page !== "departments") parentTopic = "Departments";
    else if (isUnderDiscovery && page !== "discovery" && !isUnderClient && !isUnderCredentials && !isUnderMonitoringProfile) parentTopic = "Discovery";
    else if (isUnderClient && page !== "client") parentTopic = "Client";
    else if (isUnderCredentials && page !== "credentials") parentTopic = "Credentials";
    else if (isUnderMonitoringProfile && page !== "monitoring-profile") parentTopic = "Monitoring Profile";
    else if (isUnderSacm && page !== "sacm") parentTopic = "SACM";
    else if (isUnderUsers && page !== "users") parentTopic = "Users";
    else if (isUnderManagementFunctions && page !== "management-functions" && !isUnderProcurement) parentTopic = "Management Functions";
    else if (isUnderProcurement && page !== "procurement") parentTopic = "Procurement";
    else if (isUnderIntegrations && page !== "integrations" && !isUnderCherwellCredential && !isUnderIvantiCredentials && !isUnderJiraCredentials && !isUnderServicenowCredentials) parentTopic = "Integrations";
    else if (isUnderCherwellCredential && page !== "cherwell-credential") parentTopic = "Cherwell Credential";
    else if (isUnderIvantiCredentials && page !== "ivanti-credentials") parentTopic = "Ivanti Credentials";
    else if (isUnderJiraCredentials && page !== "jira-credentials") parentTopic = "Jira Credentials";
    else if (isUnderServicenowCredentials && page !== "servicenow-credentials") parentTopic = "ServiceNow Credentials";
    else if (isUnderOthers && page !== "others") parentTopic = "Others";
    else if (isUnderVulnerabilityManagement && page !== "vulnerability-management") parentTopic = "Vulnerability Management";
    
    // Format page name for display using TOC label lookup
    const pageDisplayName = getPageLabel(page);
    
    return (
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleNames[module] || module}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => {
                  // Navigate to section (first page of the section)
                  if (onPageClick) {
                    // Get the first page of the section based on module and actual section
                    let firstPage = '';
                    if (actualSection === 'getting-started') {
                      firstPage = 'quick-start';
                    } else if (actualSection === 'application-overview') {
                      firstPage = 'system-icons';
                    } else if (actualSection === 'organizational-details') {
                      firstPage = 'organizational-details';
                    } else if (actualSection === 'discovery') {
                      firstPage = 'application-map';
                    } else if (actualSection === 'sacm') {
                      firstPage = 'blueprints';
                    } else if (actualSection === 'users') {
                      firstPage = 'ad-configuration';
                    } else if (actualSection === 'management-functions') {
                      firstPage = 'change-management';
                    } else if (actualSection === 'integrations') {
                      firstPage = 'cherwell-credential';
                    } else if (actualSection === 'others') {
                      firstPage = 'announcements';
                    } else if (module === 'my-dashboard' && actualSection === 'my-dashboard') {
                      firstPage = 'my-dashboard-overview';
                    } else if (module === 'cmdb' && actualSection === 'cmdb') {
                      firstPage = 'access-cmdb';
                    } else if (module === 'discovery-scan' && actualSection === 'discovery-scan') {
                      firstPage = 'access-dashboard';
                    } else {
                      firstPage = 'advanced-search';
                    }
                    onPageClick(version, module, actualSection, firstPage);
                  }
                }}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {parentTopic && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleParentTopicClick(parentTopic)}
                    className="text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors"
                  >
                    {parentTopic}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            {/* My Dashboard nested hierarchy */}
            {isUnderMyDashboardSection && page !== "my-dashboard-section" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("My Dashboard", "my-dashboard-section")}>
                    My Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - Manage CMDB */}
            {isUnderManageCmdb && page !== "manage-cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - View and Edit a CI */}
            {isUnderViewEditCi && page !== "view-and-edit-ci" && !isUnderCiDetails && !isUnderDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - CI Details and Tabs */}
            {(isUnderCiDetails || isUnderDetailsNested) && page !== "ci-details-and-tabs" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - Details */}
            {isUnderDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Run a Scan hierarchy */}
            {isUnderInitiateConfigure && page !== "initiate-and-configure-discovery-scan" && !isUnderConfigureDiscovery && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderConfigureDiscovery && page !== "configure-discovery-scan" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configure Discovery Scan", "configure-discovery-scan")}>
                    Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {page === "configure-discovery-scan" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Recent Scans hierarchy */}
            {isUnderViewRecentScan && page !== "view-recent-scan" && !isUnderRecentScanDetails && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderRecentScanDetails && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleNestedTopicClick("Details", "details")}
                    className="text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors"
                  >
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {page === "details" && section === "discovery-scan" && isUnderViewRecentScan && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Azure AD User Import Logs hierarchy */}
            {isUnderAzureAd && page !== "azure-ad-user-import-logs" && !isUnderAzureAdConfigurationAndImport && !isUnderViewImportLogDetailsAzure && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderAzureAdConfigurationAndImport && page !== "azure-ad-configuration-and-import" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD Configuration and Import", "azure-ad-configuration-and-import")}>
                    Azure AD Configuration and Import
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportLogDetailsAzure && page !== "view-import-log-details-azure" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Import Log Details", "view-import-log-details-azure")}>
                    View Import Log Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Scheduled Scans and Imports hierarchy */}
            {isUnderScansImportOptions && page !== "scans-and-import-options" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Scans and Import Options", "scans-and-import-options")}>
                    Scans and Import Options
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Dashboard hierarchy */}
            {isUnderDashboard && page !== "dashboard" && !isUnderRunAScan && !isUnderRecentScans && !isUnderScheduledScansImports && !isUnderIpamNetworks && !isUnderDiscoveredItems && !isUnderImportFromAWS && !isUnderImportFromAzure && !isUnderImportFromMeraki && !isUnderImportFromIntune && !isUnderImportDataFiles && !isUnderImportedAssets && !isUnderAdUserImportLogs && !isUnderAzureAd && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Dashboard", "dashboard")}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - IPAM Networks hierarchy */}
            {isUnderIpamNetworks && page !== "ipam-networks" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderIpamFunctionsOverview && page !== "ipam-functions-overview" && !isUnderScanFunction && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Functions Overview", "ipam-functions-overview")}>
                    IPAM Functions Overview
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderScanFunction && page !== "scan-function" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Functions Overview", "ipam-functions-overview")}>
                    IPAM Functions Overview
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Scan Function", "scan-function")}>
                    Scan Function
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Discovered Items hierarchy */}
            {isUnderManageDiscoveredItems && page !== "manage-discovered-items" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage Discovered Items", "manage-discovered-items")}>
                    Manage Discovered Items
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderDetailedViewDiscoveredItems && page !== "detailed-view-of-discovered-items" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Detailed View of Discovered Items", "detailed-view-of-discovered-items")}>
                    Detailed View of Discovered Items
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderOtherFunctionsDiscoveredItems && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from AWS hierarchy */}
            {isUnderImportFromAWS && page !== "import-from-aws" && !isUnderViewAwsImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from AWS", "import-from-aws")}>
                    Import from AWS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewAwsImportRecord && page !== "view-aws-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from AWS", "import-from-aws")}>
                    Import from AWS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View AWS Import Record", "view-aws-import-record")}>
                    View AWS Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Azure hierarchy */}
            {isUnderImportFromAzure && page !== "import-from-azure" && !isUnderViewAzureImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Azure", "import-from-azure")}>
                    Import from Azure
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewAzureImportRecord && page !== "view-azure-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Azure", "import-from-azure")}>
                    Import from Azure
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View AZURE Import Record", "view-azure-import-record")}>
                    View AZURE Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Meraki hierarchy */}
            {isUnderImportFromMeraki && page !== "import-from-meraki" && !isUnderViewMerakiImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Meraki", "import-from-meraki")}>
                    Import from Meraki
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewMerakiImportRecord && page !== "view-meraki-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Meraki", "import-from-meraki")}>
                    Import from Meraki
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Meraki Import Record", "view-meraki-import-record")}>
                    View Meraki Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Intune hierarchy */}
            {isUnderImportFromIntune && page !== "import-from-intune" && !isUnderViewIntuneImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Intune", "import-from-intune")}>
                    Import from Intune
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewIntuneImportRecord && page !== "view-intune-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Intune", "import-from-intune")}>
                    Import from Intune
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Intune Import Record", "view-intune-import-record")}>
                    View Intune Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import Data Files hierarchy */}
            {isUnderImportDataFiles && page !== "import-data-files" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import Data Files", "import-data-files")}>
                    Import Data Files
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportedDataFile && page !== "view-an-imported-data-file" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import Data Files", "import-data-files")}>
                    Import Data Files
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View an Imported Data File", "view-an-imported-data-file")}>
                    View an Imported Data File
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Imported Assets hierarchy */}
            {isUnderImportedAssets && page !== "imported-assets" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Imported Assets", "imported-assets")}>
                    Imported Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - AD User Import Logs hierarchy */}
            {isUnderAdUserImportLogs && page !== "ad-user-import-logs" && !isUnderAdConfigurationAndImport && !isUnderViewImportLogDetails && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderAdConfigurationAndImport && page !== "ad-configuration-and-import" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD Configuration and Import", "ad-configuration-and-import")}>
                    AD Configuration and Import
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportLogDetails && page !== "view-import-log-details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Import Log Details", "view-import-log-details")}>
                    View Import Log Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Configuration Management hierarchy */}
            {isUnderConfigurationManagement && page !== "configuration-management" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configuration Management", "configuration-management")}>
                    Configuration Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - CMDB level (show for all CMDB pages under Configuration Management, including manage-cmdb) */}
            {isUnderItsmCmdb && page !== "cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CMDB", "cmdb")}>
                    CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Manage CMDB level (show for manage-cmdb page and its child pages) */}
            {isUnderItsmManageCmdb && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {page !== "manage-cmdb" && <BreadcrumbSeparator />}
              </>
            )}
            {/* ITSM - View and Edit a CI level (nested under CMDB) */}
            {isUnderItsmViewEditCi && page !== "view-and-edit-ci" && !isUnderItsmCiDetails && !isUnderItsmOtherFunctions && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - CI Details and Tabs level (nested under View and Edit a CI) */}
            {isUnderItsmCiDetails && page !== "ci-details-and-tabs" && !isUnderItsmDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Details nested level (nested under CI Details and Tabs) */}
            {isUnderItsmDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Other Functions and Page Elements level (nested under CMDB) */}
            {isUnderItsmOtherFunctions && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Configuration Management hierarchy */}
            {(section === "itam" && (itamConfigurationManagementPages.includes(page) || page === "configuration-management")) && page !== "configuration-management" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configuration Management", "configuration-management")}>
                    Configuration Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - CMDB level (show for all CMDB pages under Configuration Management, including manage-cmdb) */}
            {isUnderItamCmdb && page !== "cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CMDB", "cmdb")}>
                    CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Manage CMDB level (show for manage-cmdb page and its child pages) */}
            {isUnderItamManageCmdb && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {page !== "manage-cmdb" && <BreadcrumbSeparator />}
              </>
            )}
            {/* ITAM - View and Edit a CI level (nested under CMDB) */}
            {isUnderItamViewEditCi && page !== "view-and-edit-ci" && !isUnderItamCiDetails && !isUnderItamOtherFunctions && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - CI Details and Tabs level (nested under View and Edit a CI) */}
            {isUnderItamCiDetails && page !== "ci-details-and-tabs" && !isUnderItamDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Details nested level (nested under CI Details and Tabs) */}
            {isUnderItamDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Other Functions and Page Elements level (nested under CMDB) */}
            {isUnderItamOtherFunctions && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Procurement hierarchy */}
            {isUnderItamProcurement && page !== "procurement" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Procurement", "procurement")}>
                    Procurement
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Admin nested hierarchy */}
            {isUnderDepartments && page !== "departments" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Departments", "departments")}>
                    Departments
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderClient && page !== "client" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Client", "client")}>
                    Client
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderCredentials && page !== "credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Credentials", "credentials")}>
                    Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderProcurement && page !== "procurement" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Procurement", "procurement")}>
                    Procurement
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderCherwellCredential && page !== "cherwell-credential" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Cherwell Credential", "cherwell-credential")}>
                    Cherwell Credential
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderIvantiCredentials && page !== "ivanti-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Ivanti Credentials", "ivanti-credentials")}>
                    Ivanti Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderJiraCredentials && page !== "jira-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Jira Credentials", "jira-credentials")}>
                    Jira Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderServicenowCredentials && page !== "servicenow-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("ServiceNow Credentials", "servicenow-credentials")}>
                    ServiceNow Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Program/Project Management - Programs nested level */}
            {isUnderPrograms && page !== "programs" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Programs", "programs")}>
                    Programs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Program/Project Management - Projects nested level */}
            {isUnderProjects && page !== "projects" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Projects", "projects")}>
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                {pageDisplayName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  };

  const renderContent = () => {
    const contentKey = `${section}-${page}`;
    
    // Try to resolve MDX file path first
    const mdxPath = resolveMDXPath({ version, module, section, page });
    
    // If we have a valid MDX path, try to load it
    if (mdxPath) {
      return (
        <article className="prose prose-slate max-w-none -mt-9">
          {renderBreadcrumbs()}
          <MDXContent filePath={mdxPath} />
        </article>
      );
    }

    // Fallback to hardcoded content for specific pages
    switch (contentKey) {
      case "application-overview-online-help":
        return (
          <OnlineHelpOverview
            version={version}
            module={module}
            moduleName={moduleName}
            section={section}
            page={page}
            onHomeClick={onHomeClick}
            onModuleClick={onModuleClick}
            onVersionClick={onVersionClick}
          />
        );
      case "getting-started-quick-start":
        return (
          <QuickStart
            version={version}
            module={module}
            moduleName={moduleName}
            section={section}
            page={page}
            onHomeClick={onHomeClick}
            onModuleClick={onModuleClick}
            onVersionClick={onVersionClick}
          />
        );
      default:
        return (
          <DefaultContent
            section={section}
            page={page}
            version={version}
            module={module}
            moduleName={moduleName}
            onHomeClick={onHomeClick}
            onModuleClick={onModuleClick}
            onVersionClick={onVersionClick}
            onPageClick={onPageClick}
          />
        );
    }
  };

  return (
    <>
      <Seo
        page={pageSeo}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
        canonicalPath={normalizedPath}
        breadcrumbs={seoBreadcrumbs}
      />
      <div className="flex max-w-[1800px] mx-auto">
        <div className="flex-1 px-6 lg:px-12 py-12 lg:py-16 max-w-4xl">
          {renderContent()}
        </div>
        <aside className="w-64 px-6 py-12 lg:py-16 border-l border-slate-200/60 hidden xl:block">
          <div className="-mt-12 mb-6 pb-6 border-b border-slate-200/60">
            <div className="flex items-start gap-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Release Date</div>
                <div className="text-sm text-slate-700 text-[14px]">November 1, 2025</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Last Updated</div>
                <div className="text-sm text-slate-700">November 10, 2025</div>
              </div>
            </div>
          </div>
          {/* TableOfContents auto-detects H2/H3 headings from content - works for all modules and versions */}
          {/* contentSelector targets: article elements, .prose class, and article.prose combinations */}
          <TableOfContents items={[]} contentSelector="article, .prose, article.prose" />
        </aside>
      </div>
    </>
  );
}

function OnlineHelpOverview({
  version,
  module,
  moduleName,
  section,
  page = "online-help",
  onHomeClick,
  onModuleClick,
  onVersionClick,
}: {
  version: string;
  module: string;
  moduleName: string;
  section: string;
  page?: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
}) {
  const getModuleDescription = () => {
    switch (module) {
      case "admin":
        return "Admin provides comprehensive administrative functions for organizational setup, user management, discovery configuration, SACM settings, integrations, and system-wide configurations.";
      case "my-dashboard":
        return "My Dashboard provides a centralized, customizable view of your IT environment with real-time monitoring, widgets, and analytics.";
      case "cmdb":
        return "The Configuration Management Database (CMDB) tracks and manages all IT assets, their attributes, and relationships across your infrastructure.";
      case "discovery-scan":
        return "Discovery Scan automatically discovers and scans IT infrastructure, applications, and cloud resources across your network.";
      case "itsm":
        return "IT Service Management (ITSM) provides comprehensive incident, problem, change, and service request management capabilities.";
      case "vulnerability-management":
        return "Vulnerability Management identifies, assesses, prioritizes, and helps remediate security vulnerabilities across your IT infrastructure.";
      case "itam":
        return "IT Asset Management (ITAM) provides complete lifecycle management of hardware and software assets from procurement to retirement.";
      case "self-service":
        return "Self Service Portal empowers users with self-service capabilities for requests, catalog items, knowledge base access, and ticket tracking.";
      case "program-project-management":
        return "Program and Project Management helps you plan, track, and manage IT programs and projects with resource allocation and portfolio management.";
      case "risk-register":
        return "Risk Register tracks and manages IT risks with comprehensive assessment, mitigation planning, and compliance monitoring capabilities.";
      case "reports":
        return "Reports provides comprehensive reporting and analytics with customizable dashboards, scheduled reports, and data visualization.";
      default:
        return `${moduleName} module provides comprehensive capabilities for managing your IT environment.`;
    }
  };

  // Get page display name
  const getPageLabel = (pageId: string): string => {
    const pageLabelMap: Record<string, string> = {
      "online-help": "Online Help",
      "system-icons": "System Icons",
      "user-specific-functions": "User Specific Functions",
    };
    if (pageLabelMap[pageId]) {
      return pageLabelMap[pageId];
    }
    return pageId
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const pageDisplayName = getPageLabel(page || "online-help");
  const sectionDisplayName = getSectionDisplayName(section);

  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                {pageDisplayName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <span className="text-xs text-slate-500">
          Last updated: November 10, 2025
        </span>
      </div>

      <h1 id="my-dashboard-overview" className="text-slate-900 mb-6 scroll-mt-20">{moduleName} Overview</h1>

      <p className="text-slate-600 leading-relaxed mb-4">
        {getModuleDescription()}
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12 not-prose">
        <p className="text-sm text-green-800">
          <strong>Version Notice:</strong> This documentation is
          for {moduleName} in Virima version{" "}
          <strong>{version}</strong>. Make sure you're viewing
          the correct version for your deployment.
        </p>
      </div>

      <h2 id="key-capabilities" className="mt-12 mb-6">
        Key Capabilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        <div className="border border-slate-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all">
          <h3 className="mb-3 text-slate-900">
            Comprehensive Management
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Complete management capabilities with intuitive
            interfaces and powerful automation features.
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all">
          <h3 className="mb-3 text-slate-900">
            Real-time Monitoring
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Monitor activities and changes in real-time with
            instant notifications and alerts.
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all">
          <h3 className="mb-3 text-slate-900">
            Advanced Reporting
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generate detailed reports and analytics with
            customizable dashboards and visualizations.
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all">
          <h3 className="mb-3 text-slate-900">
            Integration Ready
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Seamlessly integrate with third-party tools and
            platforms via REST APIs and webhooks.
          </p>
        </div>
      </div>

      {module === "my-dashboard" && (
        <>
          <h2 id="about-virima-modules" className="mt-12 mb-6">
            About the Virima Modules and Functions
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            The All Modules window contains quick access to selected functions. From this main window, all functions are reached either through:
          </p>
          <ul className="mb-6">
            <li>The <strong>Navigation pane</strong> (down the left side of the window)</li>
            <li>The <strong>Admin menu</strong> (in the upper right corner of the window)</li>
          </ul>
          
          <div className="my-8 not-prose">
            <img 
              src="figma:asset/f9381b35c98ccaabf8b82fb583cf3f28e2b6db92.png" 
              alt="Virima Application Overview"
              className="w-full border border-slate-200 rounded-lg shadow-md"
            />
          </div>

          <h3 className="mt-8 mb-4">Home Page/All Modules Window</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            The home page provides quick access to the most frequently used modules, such as favorite functions and dashboards.
          </p>
          <ul className="mb-6">
            <li><strong>Adding a Favorite:</strong> Locate an icon for the applicable section inside the box with the text, "Drag here to add."</li>
            <li><strong>Deleting a Favorite:</strong> Locate the icon in the Favorites section. Then, click and drag the icon above the Favorite section until the text "Drag here to delete" inside a red box displays.</li>
          </ul>

          <h3 className="mt-8 mb-4">Left Navigation Pane</h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            The left navigation pane includes the following:
          </p>
          <ul className="mb-6">
            <li><strong>My Dashboard</strong> displays data content information with a customization option.</li>
            <li><strong>Discovery Scan</strong> manages scanning activities (running, scheduling, etc.) and importing data (such as from AWS and Azure).</li>
            <li><strong>ITAM</strong> (asset management functions) and <strong>ITSM</strong> (service management functions) availability is based upon the subscription.</li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 not-prose">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The menu heading displayed - either ITAM or ITSM - is based upon the subscription.
            </p>
          </div>

          <ul className="mb-6">
            <li><strong>Vulnerability Management</strong> identifies, evaluates, and reports security vulnerabilities in CIs present inside the CMDB.</li>
            <li><strong>Self Service</strong> creates catalog items and shows incidents and requests for the current user.</li>
            <li><strong>Project and Program Management</strong> defines project aspects and managing related projects.</li>
            <li><strong>Risk Register</strong> provides a tool for managing risk and compliance.</li>
            <li><strong>Reports</strong> has both canned and custom ad hoc reports.</li>
            <li><strong>MSP</strong> displays a list of clients and includes a Dashboard, Reports, My Incidents, and Administrative functions (Client, Users, Mailbox Monitoring Configuration, and Email Templates). It also provides access to the Virima application.</li>
          </ul>

          <h3 className="mt-8 mb-4">Admin Window</h3>
          <p className="text-slate-600 leading-relaxed mb-6">
            The administrative functions include the following:
          </p>
          <ul className="mb-8">
            <li>Configuration displays setting details, such as departments, cost centers, locations, designations, operational hours, and holidays.</li>
          </ul>
        </>
      )}

      <h2 id="getting-started" className="mt-12 mb-6">
        Getting Started
      </h2>
      <p className="text-slate-600 leading-relaxed mb-4">
        To start using {moduleName}, navigate through the
        documentation sections:
      </p>
      <div className="space-y-3 not-prose mb-12">
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>Online Help</strong> — Detailed guides and
              how-to articles
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>Release Notes</strong> — Latest updates
              and improvements
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>Getting Started</strong> — Quick start
              guides for new users
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>Manuals</strong> — Complete reference
              documentation
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>API Integration</strong> — Developer
              guides and API references
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full mt-0.5"></div>
          <div>
            <p className="text-slate-900">
              <strong>Compatibility Matrix</strong> — System
              requirements and compatibility
            </p>
          </div>
        </div>
      </div>

      <h2 id="whats-new" className="mt-12 mb-6">
        What's New in Version {version}
      </h2>
      <p className="text-slate-600 leading-relaxed">
        Version {version} includes significant improvements in
        performance, new capabilities, enhanced visualization
        features, and expanded integration options for{" "}
        {moduleName}.
      </p>
    </article>
  );
}

function LatestRelease({
  version,
  module,
  moduleName,
  section,
  onHomeClick,
  onModuleClick,
  onVersionClick,
}: {
  version: string;
  module: string;
  moduleName: string;
  section: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
}) {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {getSectionDisplayName(section)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                Latest Release
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1">
            Latest
          </Badge>
          <span className="text-xs text-slate-500">
            Last updated: November 10, 2025
          </span>
        </div>
      </div>

      <h1 className="text-slate-900 mb-6">{moduleName} - Release Notes</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-12">
        Version {version} brings enhanced performance, new
        features, and important bug fixes to {moduleName}.
      </p>

      <h2 id="new-features" className="mt-12 mb-6">
        New Features
      </h2>

      <div className="space-y-6 not-prose mb-12">
        <div className="border-l-4 border-emerald-500 pl-6 py-2">
          <div className="flex items-start gap-3 mb-2">
            <Badge variant="outline" className="text-xs">
              Feature
            </Badge>
          </div>
          <h3 className="mb-2 text-slate-900">
            Enhanced User Interface
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Redesigned interface with improved navigation,
            better accessibility, and modern design patterns.
          </p>
        </div>

        <div className="border-l-4 border-emerald-500 pl-6 py-2">
          <div className="flex items-start gap-3 mb-2">
            <Badge variant="outline" className="text-xs">
              Feature
            </Badge>
          </div>
          <h3 className="mb-2 text-slate-900">
            Advanced Analytics
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            New analytics dashboard with real-time insights,
            predictive analytics, and customizable widgets.
          </p>
        </div>

        <div className="border-l-4 border-emerald-500 pl-6 py-2">
          <div className="flex items-start gap-3 mb-2">
            <Badge variant="outline" className="text-xs">
              Feature
            </Badge>
          </div>
          <h3 className="mb-2 text-slate-900">
            Automation Capabilities
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Enhanced automation with workflow builder, scheduled
            tasks, and intelligent recommendations.
          </p>
        </div>
      </div>

      <h2 id="improvements" className="mt-12 mb-6">
        Improvements
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>
          Performance optimization for large datasets (50%
          faster load times)
        </li>
        <li>
          Enhanced search with fuzzy matching and advanced
          filters
        </li>
        <li>
          Improved export capabilities with multiple format
          support
        </li>
        <li>
          Better mobile responsiveness and touch interface
          support
        </li>
        <li>Enhanced security with MFA and SSO integration</li>
      </ul>

      <h2 id="bug-fixes" className="mt-12 mb-6">
        Bug Fixes
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>
          Fixed issue with data synchronization in real-time
          updates
        </li>
        <li>Resolved memory leak in long-running operations</li>
        <li>
          Fixed UI rendering issues in specific browser
          configurations
        </li>
        <li>
          Corrected timezone handling in scheduled operations
        </li>
        <li>
          Fixed export formatting issues with special characters
        </li>
      </ul>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-12 not-prose">
        <p className="text-sm text-blue-900">
          <strong>Upgrade Notice:</strong> This version includes
          database schema updates for {moduleName}. Please
          review the upgrade guide and backup your data before
          proceeding.
        </p>
      </div>
    </article>
  );
}

function QuickStart({
  version,
  module,
  moduleName,
  section,
  page = "quick-start",
  onHomeClick,
  onModuleClick,
  onVersionClick,
}: {
  version: string;
  module: string;
  moduleName: string;
  section: string;
  page?: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
}) {
  const sectionDisplayName = getSectionDisplayName(section);
  
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                Quick Start
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-slate-900 mb-6">{moduleName} - Quick Start</h1>

      <p className="text-lg text-slate-600 leading-relaxed mb-12">
        Get started with {moduleName} in just a few minutes.
        This guide covers the essential steps to configure and
        start using the module.
      </p>

      <h2 id="prerequisites" className="mt-12 mb-6">
        Prerequisites
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>Virima {version} installed and configured</li>
        <li>Appropriate user permissions and roles assigned</li>
        <li>Network access to required resources</li>
        <li>Browser meets compatibility requirements</li>
      </ul>

      <h2 id="quick-start-steps" className="mt-12 mb-6">
        Quick Start Steps
      </h2>

      <div className="space-y-8 not-prose mb-12">
        <div className="flex gap-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shrink-0">
            1
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-slate-900">
              Access {moduleName}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Navigate to the {moduleName} module from the main
              Virima dashboard. You can find it in the left
              navigation menu or quick access panel.
            </p>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="flex gap-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shrink-0">
            2
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-slate-900">
              Initial Configuration
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Complete the initial configuration wizard. This
              includes setting up basic preferences,
              notification settings, and data sources.
            </p>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="flex gap-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shrink-0">
            3
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-slate-900">
              Explore Dashboard
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Familiarize yourself with the {moduleName}{" "}
              dashboard. Customize widgets, arrange panels, and
              configure your preferred view.
            </p>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="flex gap-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shrink-0">
            4
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-slate-900">
              Start Using Features
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Begin using the core features of {moduleName}.
              Refer to the User Guide for detailed information
              on specific capabilities.
            </p>
          </div>
        </div>
      </div>

      <h2 id="next-steps" className="mt-12 mb-6">
        Next Steps
      </h2>
      <p className="text-slate-600 leading-relaxed mb-4">
        After completing the quick start, explore these
        resources:
      </p>
      <ul className="space-y-2 text-slate-600">
        <li>
          Review the User Manual for comprehensive feature
          documentation
        </li>
        <li>
          Configure advanced settings and automation rules
        </li>
        <li>
          Set up integrations with other modules and external
          systems
        </li>
        <li>Create custom reports and dashboards</li>
        <li>Review security and compliance best practices</li>
      </ul>
    </article>
  );
}

function APIOverview({
  version,
  module,
  moduleName,
  section,
  page = "api-overview",
  onHomeClick,
  onModuleClick,
  onVersionClick,
}: {
  version: string;
  module: string;
  moduleName: string;
  section: string;
  page?: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
}) {
  const sectionDisplayName = getSectionDisplayName(section);
  
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                API Overview
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-slate-900 mb-6">{moduleName} - API Integration</h1>

      <p className="text-lg text-slate-600 leading-relaxed mb-12">
        The {moduleName} API provides comprehensive REST
        endpoints for integration with third-party systems,
        automation workflows, and custom applications.
      </p>

      <h2 id="api-endpoints" className="mt-12 mb-6">
        API Endpoints
      </h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        All API endpoints follow RESTful conventions with JSON
        request/response format.
      </p>

      <div className="not-prose space-y-3 mb-12">
        <div className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <code className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded">
                GET
              </code>
              <span className="text-sm font-mono text-slate-700">
                /api/v1/{module}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              List all items
            </span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <code className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded">
                POST
              </code>
              <span className="text-sm font-mono text-slate-700">
                /api/v1/{module}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              Create new item
            </span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <code className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded">
                GET
              </code>
              <span className="text-sm font-mono text-slate-700">
                /api/v1/{module}/:id
              </span>
            </div>
            <span className="text-sm text-slate-500">
              Get item details
            </span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <code className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded">
                PUT
              </code>
              <span className="text-sm font-mono text-slate-700">
                /api/v1/{module}/:id
              </span>
            </div>
            <span className="text-sm text-slate-500">
              Update item
            </span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <code className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded">
                DELETE
              </code>
              <span className="text-sm font-mono text-slate-700">
                /api/v1/{module}/:id
              </span>
            </div>
            <span className="text-sm text-slate-500">
              Delete item
            </span>
          </div>
        </div>
      </div>

      <h2 id="authentication" className="mt-12 mb-6">
        Authentication
      </h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        All API requests require authentication using API keys
        or OAuth 2.0 tokens.
      </p>

      <div className="bg-slate-900 text-slate-100 p-6 rounded-lg text-sm font-mono not-prose mb-12 overflow-x-auto">
        <div className="text-slate-400 mb-2">
          # Example API request
        </div>
        <div>
          curl -H "Authorization: Bearer YOUR_API_KEY" \
        </div>
        <div className="ml-4">
          -H "Content-Type: application/json" \
        </div>
        <div className="ml-4">
          https://your-server/api/v1/{module}
        </div>
      </div>

      <h2 id="response-format" className="mt-12 mb-6">
        Response Format
      </h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        All API responses follow a standard JSON format with
        consistent status codes.
      </p>

      <div className="bg-slate-900 text-slate-100 p-6 rounded-lg text-sm font-mono not-prose mb-12 overflow-x-auto">
        <pre>{`{
  "status": "success",
  "data": {
    "id": "item-12345",
    "module": "${module}",
    "created_at": "2025-11-10T10:30:00Z",
    "updated_at": "2025-11-10T14:22:15Z"
  },
  "meta": {
    "version": "${version}",
    "timestamp": "2025-11-10T14:22:15Z"
  }
}`}</pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 not-prose">
        <p className="text-sm text-blue-900">
          <strong>Rate Limiting:</strong> API requests are
          limited to 1000 requests per hour per API key. Contact
          support for higher limits or enterprise plans.
        </p>
      </div>
    </article>
  );
}

function SystemRequirements({
  version,
  module,
  moduleName,
  section,
  page = "system-requirements",
  onHomeClick,
  onModuleClick,
  onVersionClick,
}: {
  version: string;
  module: string;
  moduleName: string;
  section: string;
  page?: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
}) {
  const sectionDisplayName = getSectionDisplayName(section);
  
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                System Requirements
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-slate-900 mb-6">
        {moduleName} - System Requirements
      </h1>

      <p className="text-lg text-slate-600 leading-relaxed mb-12">
        Review the system requirements and compatibility
        information for {moduleName} module.
      </p>

      <h2 id="browser-compatibility" className="mt-12 mb-6">
        Browser Compatibility
      </h2>

      <div className="not-prose mb-12 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-slate-900">
                Browser
              </TableHead>
              <TableHead className="text-slate-900">
                Minimum Version
              </TableHead>
              <TableHead className="text-slate-900">
                Recommended
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Google Chrome</TableCell>
              <TableCell className="text-slate-600">
                100+
              </TableCell>
              <TableCell className="text-slate-600">
                Latest version
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mozilla Firefox</TableCell>
              <TableCell className="text-slate-600">
                100+
              </TableCell>
              <TableCell className="text-slate-600">
                Latest version
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Microsoft Edge</TableCell>
              <TableCell className="text-slate-600">
                100+
              </TableCell>
              <TableCell className="text-slate-600">
                Latest version
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Safari</TableCell>
              <TableCell className="text-slate-600">
                15+
              </TableCell>
              <TableCell className="text-slate-600">
                Latest version
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <h2 id="user-permissions" className="mt-12 mb-6">
        User Permissions
      </h2>

      <div className="not-prose mb-12 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-slate-900">
                Role
              </TableHead>
              <TableHead className="text-slate-900">
                Access Level
              </TableHead>
              <TableHead className="text-slate-900">
                Capabilities
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Administrator</TableCell>
              <TableCell className="text-slate-600">
                Full Access
              </TableCell>
              <TableCell className="text-slate-600">
                All features and configuration
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Power User</TableCell>
              <TableCell className="text-slate-600">
                Advanced
              </TableCell>
              <TableCell className="text-slate-600">
                Advanced features, limited config
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Standard User</TableCell>
              <TableCell className="text-slate-600">
                Standard
              </TableCell>
              <TableCell className="text-slate-600">
                Basic features and reporting
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Read Only</TableCell>
              <TableCell className="text-slate-600">
                View Only
              </TableCell>
              <TableCell className="text-slate-600">
                View data and reports
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <h2 id="integration-dependencies" className="mt-12 mb-6">
        Integration Dependencies
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>Virima Core Platform {version} or later</li>
        <li>
          Database connectivity (PostgreSQL, MySQL, or SQL
          Server)
        </li>
        <li>
          Network access to required endpoints and services
        </li>
        <li>Appropriate firewall rules configured</li>
        <li>SSL/TLS certificates for secure communications</li>
      </ul>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-12 not-prose">
        <p className="text-sm text-amber-900">
          <strong>Note:</strong> Additional requirements may
          apply based on your specific deployment configuration
          and integration requirements. Contact Virima support
          for detailed sizing and planning assistance.
        </p>
      </div>
    </article>
  );
}

function DefaultContent({
  section,
  page,
  version,
  module,
  moduleName,
  onHomeClick,
  onModuleClick,
  onVersionClick,
  onPageClick,
}: {
  section: string;
  page: string;
  version: string;
  module: string;
  moduleName: string;
  onHomeClick?: () => void;
  onModuleClick?: () => void;
  onVersionClick?: () => void;
  onPageClick?: (version: string, module: string, section: string, page: string) => void;
}) {
  /**
   * BREADCRUMB HIERARCHY SYSTEM
   * 
   * This system ensures breadcrumbs show the complete navigation path including all parent levels.
   * Each array contains child pages under a parent topic. Parent pages themselves are also included
   * in their respective arrays using the OR condition (e.g., `page === "parent-page-id"`).
   * 
   * Structure by module:
   * - My Dashboard > Application Overview: Shared Functions > [child pages]
   * - My Dashboard > My Dashboard: Dashboards > [child pages] > My Dashboard > [nested child pages]
   * - CMDB: Manage CMDB / View and Edit a CI / CI Details and Tabs > [child pages] > Details > [nested child pages]
   * - Discovery Scan: Dashboard / Run a Scan / Recent Scans / Azure AD User Import Logs > [child pages with nested hierarchies]
   */
  
  // Helper function to get page label from page ID (matches TOC structure)
  // This ensures breadcrumb labels match the TOC exactly
  const getPageLabel = (pageId: string): string => {
    // Map of page IDs to their display labels (matching TOC structure)
    const pageLabelMap: Record<string, string> = {
      // Application Overview pages
      "system-icons": "System Icons",
      "user-specific-functions": "User Specific Functions",
      "online-help": "Online Help",
      "shared-functions": "Shared Functions",
      "advanced-search": "Advanced Search",
      "attachments": "Attachments",
      "auto-refresh": "Auto Refresh",
      "collapse-maximize": "Collapse/Maximize",
      "comments": "Comments",
      "copy-to-cherwell": "Copy to Cherwell",
      "copy-to-ivanti": "Copy to Ivanti",
      "copy-to-jira": "Copy to Jira",
      "copy-to-servicenow": "Copy to ServiceNow",
      "delete-remove": "Delete/Remove",
      "email-preferences": "Email Preferences",
      "enable-disable-editing": "Enable/Disable Editing",
      "export": "Export",
      "filter-by": "Filter By",
      "history": "History",
      "import": "Import",
      "items-per-page": "Items per Page",
      "mark-as-knowledge": "Mark as Knowledge",
      "other-asset-info": "Other Asset Info",
      "outage-calendar": "Outage Calendar",
      "personalize-columns": "Personalize Columns",
      "print": "Print",
      "process-adm": "Process ADM",
      "process-missing-components": "Process Missing Components",
      "records-per-page": "Records per Page",
      "reload-default-mapping": "Reload Default Mapping",
      "re-scan": "Re-scan",
      "re-sync-data": "Re-Sync Data",
      "save": "Save",
      "saved-filters": "Saved Filters",
      "searching": "Searching",
      "show-main-all-properties": "Show Main/All Properties",
      "tasks": "Tasks",
      "updates": "Updates",
      "version-control": "Version Control",
      // My Dashboard pages
      "my-dashboard-overview": "Overview",
      "dashboards": "Dashboards",
      "dashboards-contents": "Contents",
      "customization": "Customization",
      "report-actions": "Report Actions",
      "my-dashboard-section": "My Dashboard",
      "my-dashboard-contents": "Contents",
      // SACM pages
      "cmdb-graphical-workflow": "CMDB Graphical Workflow",
      "blueprints": "Blueprints",
      "bsm-views": "Custom BSM Views",
      "cmdb-properties": "CMDB Properties",
      "confidence-configuration": "Confidence Configuration",
      "duplicates-remediation": "Duplicates Remediation",
      "export-ci-template": "Export CI Template",
      "ip-connection-score-threshold": "IP Connection Score Threshold",
      "process-tags": "Process Tags",
      "property-group": "Property Group",
      "relationship-types": "Relationship Types",
      "software-license-validity-check": "Software License Validity Check",
      "software-usage-report": "Software Usage Report",
      // Add more mappings as needed - this ensures consistency with TOC
    };
    
    // If we have a label mapping, use it; otherwise format from page ID
    if (pageLabelMap[pageId]) {
      return pageLabelMap[pageId];
    }
    
    // Fallback: format page ID to readable label
    // Ensure CMDB and SACM are always uppercase
    return pageId
      .split("-")
      .map(word => {
        const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
        // Ensure CMDB and SACM are always uppercase
        if (capitalized === "Cmdb") return "CMDB";
        if (capitalized === "Sacm") return "SACM";
        return capitalized;
      })
      .join(" ")
      .replace(/\bCmdb\b/g, "CMDB")
      .replace(/\bSacm\b/g, "SACM");
  };
  
  // Helper function to get parent topic page ID from parent topic name
  const getParentTopicPageId = (parentTopicName: string): string | null => {
    return parentTopicPageMap[parentTopicName] || null;
  };
  
  // Handler for parent topic clicks
  const handleParentTopicClick = (parentTopicName: string) => {
    if (!onPageClick) return;
    const parentPageId = getParentTopicPageId(parentTopicName);
    if (parentPageId) {
      onPageClick(version, module, section, parentPageId);
    }
  };
  
  // Handler for nested topic clicks
  const handleNestedTopicClick = (nestedTopicName: string, nestedPageId: string) => {
    if (!onPageClick) return;
    onPageClick(version, module, section, nestedPageId);
  };
  
  // Helper to create clickable breadcrumb link props for nested topics
  const getClickableBreadcrumbProps = (topicName: string, pageId: string) => ({
    onClick: () => handleNestedTopicClick(topicName, pageId),
    className: "text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors",
  });
  
  // My Dashboard - Application Overview hierarchy
  const sharedFunctionsPages = [
    "advanced-search", "attachments", "auto-refresh", "collapse-maximize",
    "comments", "copy-to-cherwell", "copy-to-ivanti", "copy-to-servicenow",
    "delete-remove", "email-preferences", "enable-disable-editing", "export",
    "filter-by", "history", "import", "items-per-page", "mark-as-knowledge",
    "other-asset-info", "outage-calendar", "personalize-columns", "print",
    "process-adm", "process-missing-components", "records-per-page",
    "reload-default-mapping", "re-scan", "re-sync-data", "save",
    "saved-filters", "searching", "show-main-all-properties", "tasks",
    "updates", "version-control"
  ];
  
  // My Dashboard - My Dashboard section hierarchy
  const dashboardsPages = ["contents", "customization", "report-actions", "my-dashboard-section"];
  const myDashboardSectionPages = ["contents"];
  
  // CMDB breadcrumb hierarchy
  const manageCmdbPages = [
    "audits", "change-attributes", "delete", "export", "new",
    "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow",
    "generate-installed-software-report", "process-adm",
    "process-available-patch-report", "process-cloud-hierarchy",
    "process-devops", "process-missing-components", "process-network-connection",
    "process-software-installation", "process-network-virtualization-hierarchy"
  ];
  
  const viewEditCiPages = ["ci-left-panel", "contacts-on-ci"];
  
  const ciDetailsPages = [
    "details", "components", "logon-events", "itsm", "relationships",
    "audits-tab", "sla", "maintenance", "vulnerability", "private-properties",
    "tasks", "history", "attachments"
  ];
  
  const detailsNestedPages = ["manage-ci", "business-service-map"];
  
  // Discovery Scan breadcrumb hierarchy
  const dashboardPages = ["access-dashboard", "dashboard-features", "add-contents", "dashboard-customization"];
  
  const runAScanPages = ["pre-requisites-for-scan", "access-run-a-scan", "initiate-and-configure-discovery-scan", "configure-discovery-scan", "probes-configuration", "client-configuration"];
  const initiateConfigurePages = ["access-run-a-scan", "configure-discovery-scan", "probes-configuration", "client-configuration"];
  const configureDiscoveryPages = ["probes-configuration", "client-configuration"];
  
  const recentScansPages = ["access-recent-scan", "view-recent-scan", "details", "export-scan-report", "refresh", "logs", "tasks", "comments", "attachments"];
  const viewRecentScanPages = ["details", "export-scan-report", "refresh", "logs", "tasks", "comments", "attachments"];
  const recentScanDetailsPages = ["export-scan-report", "refresh"];
  
  const azureAdPages = [
    "azure-ad-configuration-and-import",
    "azure-ad-configuration-property-descriptions",
    "testing-ad-configuration-azure",
    "import-users-azure",
    "scheduled-azure-ad-import",
    "access-the-azure-ad-user-import-logs",
    "view-import-log-details-azure",
    "details-tab-azure",
    "key-information-displayed",
    "tabs-for-extended-information-azure",
    "customize-columns-azure",
  ];
  const azureAdConfigurationAndImportPages = [
    "azure-ad-configuration-property-descriptions",
    "testing-ad-configuration-azure",
    "import-users-azure",
    "scheduled-azure-ad-import",
  ];
  const viewImportLogDetailsAzurePages = [
    "details-tab-azure",
    "key-information-displayed",
    "tabs-for-extended-information-azure",
    "customize-columns-azure",
  ];
  
  const scheduledScansImportsPages = [
    "prerequisites",
    "accessing-scheduled-scan-and-imports",
    "key-features-and-options-on-the-landing-page",
    "scans-and-import-options",
    "scan-and-import-schedule-list",
    "schedule-a-network-scan",
    "editing-a-scheduled-scan",
    "history-of-scheduled-scan-execution",
    "bulk-update-scan",
    "exporting-a-scan",
    "importing-scan-schedules",
    "deleting-a-scan-schedule",
    "scheduled-import-setup",
    "aws-import",
    "azure-import",
  ];
  const scansAndImportOptionsPages = [
    "scan-and-import-schedule-list",
    "schedule-a-network-scan",
    "editing-a-scheduled-scan",
    "history-of-scheduled-scan-execution",
    "bulk-update-scan",
    "exporting-a-scan",
    "importing-scan-schedules",
    "deleting-a-scan-schedule",
  ];
  const scheduledImportSetupPages = ["aws-import", "azure-import"];
  const ipamNetworksPages = [
    "ipam-procedure",
    "infoblox-configuration",
    "ipam-ip-address-management",
    "ipam-functions-overview",
    "scan-function",
    "status-update",
    "regular-scan",
    "sync-instant-and-scheduled",
    "view-and-edit-a-network",
    "other-functions-and-page-elements-ipam",
  ];
  const ipamFunctionsOverviewPages = [
    "scan-function",
    "status-update",
    "regular-scan",
    "sync-instant-and-scheduled",
    "view-and-edit-a-network",
    "other-functions-and-page-elements-ipam",
  ];
  const scanFunctionPages = ["status-update", "regular-scan"];
  const discoveredItemsPages = [
    "prerequisites-discovered-items",
    "access-discovered-items",
    "manage-discovered-items",
    "delete-discovered-items",
    "export-discovered-items",
    "export-without-selecting-any-record",
    "move-to-cmdb",
    "re-scan",
    "column-descriptions",
    "detailed-view-of-discovered-items",
    "primary-details-block",
    "owner-block",
    "main-information-area",
    "action-buttons",
    "navigation-tabs",
    "other-functions-and-page-elements-discovered-items",
    "toolbar-or-control-bar",
    "filter-by",
  ];
  const manageDiscoveredItemsPages = [
    "delete-discovered-items",
    "export-discovered-items",
    "export-without-selecting-any-record",
    "move-to-cmdb",
    "re-scan",
  ];
  const detailedViewDiscoveredItemsPages = [
    "primary-details-block",
    "owner-block",
    "main-information-area",
    "action-buttons",
    "navigation-tabs",
    "other-functions-and-page-elements-discovered-items",
  ];
  const otherFunctionsDiscoveredItemsPages = ["toolbar-or-control-bar", "filter-by"];
  const importFromAwsPages = [
    "access-the-import-aws-window",
    "import-aws-record",
    "view-aws-import-record",
    "key-columns-aws",
    "move-items-to-cmdb-aws",
    "logs-aws",
    "delete-aws-record",
    "export-aws-records",
    "view-a-discovered-aws-record",
  ];
  const viewAwsImportRecordPages = ["key-columns-aws", "move-items-to-cmdb-aws", "logs-aws"];
  const importFromAzurePages = [
    "access-import-azure-window",
    "import-azure-record",
    "view-azure-import-record",
    "common-controls-azure",
    "key-columns-azure",
    "move-items-to-the-cmdb-azure",
    "delete-azure-record",
    "export-azure-records",
    "view-a-discovered-azure-record",
    "discovered-item-view-overview-azure",
    "top-right-actions-azure",
    "tabs-main-panel-azure",
  ];
  const viewAzureImportRecordPages = [
    "common-controls-azure",
    "key-columns-azure",
    "move-items-to-the-cmdb-azure",
    "delete-azure-record",
    "export-azure-records",
    "view-a-discovered-azure-record",
    "discovered-item-view-overview-azure",
    "top-right-actions-azure",
    "tabs-main-panel-azure",
  ];
  const importFromMerakiPages = [
    "prerequisites-meraki",
    "assess-import-meraki-window",
    "import-meraki-record",
    "view-meraki-import-record",
    "common-controls-meraki",
    "key-columns-meraki",
    "move-items-to-the-cmdb-meraki",
    "logs-meraki",
    "delete-meraki-record",
    "export-meraki-records",
    "view-a-discovered-meraki-record",
    "discovered-item-view-overview-meraki",
    "top-right-actions-meraki",
    "tabs-main-panel-meraki",
  ];
  const viewMerakiImportRecordPages = [
    "common-controls-meraki",
    "key-columns-meraki",
    "move-items-to-the-cmdb-meraki",
    "logs-meraki",
    "delete-meraki-record",
    "export-meraki-records",
    "view-a-discovered-meraki-record",
    "discovered-item-view-overview-meraki",
    "top-right-actions-meraki",
    "tabs-main-panel-meraki",
  ];
  const importFromIntunePages = [
    "access-import-from-intune",
    "import-intune-record",
    "view-intune-import-record",
    "delete-intune-record",
    "export-intune-records",
    "view-a-discovered-intune-record",
  ];
  const viewIntuneImportRecordPages = [
    "delete-intune-record",
    "export-intune-records",
    "view-a-discovered-intune-record",
  ];
  const importDataFilesPages = [
    "access-the-import-data-files",
    "manage-import-data-files",
    "import-ci",
    "view-an-imported-data-file",
    "all-tab",
    "authorized-tab",
    "unauthorized-tab",
    "import-asset-ci-relations",
    "delete-import-data-files",
    "export-import-data-files",
  ];
  const viewImportedDataFilePages = ["all-tab", "authorized-tab", "unauthorized-tab"];
  const importedAssetsPages = [
    "access-the-imported-assets",
    "manage-imported-assets",
    "imported-asset-details",
  ];
  const adUserImportLogsPages = [
    "ad-configuration-and-import",
    "ad-configuration-property-descriptions",
    "testing-ad-configuration",
    "import-users",
    "scheduled-ad-import",
    "access-the-ad-user-import-logs",
    "view-import-log-details",
    "details-tab",
    "tabs-for-extended-information",
    "customize-columns",
  ];
  const adConfigurationAndImportPages = [
    "ad-configuration-property-descriptions",
    "testing-ad-configuration",
    "import-users",
    "scheduled-ad-import",
  ];
  const viewImportLogDetailsPages = ["details-tab", "tabs-for-extended-information", "customize-columns"];
  
  // ITSM breadcrumb hierarchy
  const configurationManagementPages = ["dashboard", "cmdb", "access-cmdb", "manage-cmdb", "view-and-edit-ci", "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
  
  const itsmCmdbPages = ["access-cmdb", "manage-cmdb", "view-and-edit-ci", "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
  
  const itsmManageCmdbPages = ["audits", "change-attributes", "delete", "export", "new", "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow", "generate-installed-software-report", "process-adm", "process-available-patch-report", "process-cloud-hierarchy", "process-devops", "process-missing-components", "process-network-connection", "process-software-installation"];
  
  const itsmViewEditCiPages = ["ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments", "other-functions-and-page-elements", "sync-logs", "tags", "audits"];
  
  const itsmCiDetailsPages = ["details", "manage-ci", "business-service-map", "components", "logon-events", "itsm-tab", "relationships", "audits-tab", "sla", "maintenance", "vulnerability", "private-properties", "tasks", "history", "attachments", "comments"];
  
  const itsmDetailsNestedPages = ["manage-ci", "business-service-map"];
  
  const itsmOtherFunctionsPages = ["sync-logs", "tags", "audits"];
  
  // ITAM breadcrumb hierarchy
  const itamConfigurationManagementPages = [
    "dashboard", "cmdb", "access-cmdb", "manage-cmdb",
    "view-and-edit-ci", "ci-details-and-tabs",
    "other-functions-and-page-elements"
  ];
  const itamCmdbPages = [
    "access-cmdb", "manage-cmdb", "view-and-edit-ci",
    "ci-details-and-tabs", "other-functions-and-page-elements"
  ];
  const itamManageCmdbPages = [
    "audits", "change-attributes", "delete", "export", "new",
    "copy-to-ivanti", "copy-to-jira", "copy-to-servicenow",
    "generate-installed-software-report", "process-adm",
    "process-available-patch-report", "process-cloud-hierarchy",
    "process-devops", "process-missing-components",
    "process-network-connection", "process-software-installation",
    "process-network-virtualization-hierarchy"
  ];
  const itamViewEditCiPages = [
    "ci-left-panel", "contacts-on-ci", "ci-details-and-tabs", "details",
    "manage-ci", "business-service-map", "components", "logon-events",
    "itsm", "relationships", "audits-tab", "sla", "maintenance",
    "vulnerability", "private-properties", "tasks", "history",
    "attachments", "comments"
  ];
  const itamCiDetailsPages = [
    "details", "manage-ci", "business-service-map", "components",
    "logon-events", "itsm", "relationships", "audits-tab", "sla",
    "maintenance", "vulnerability", "private-properties", "tasks",
    "history", "attachments", "comments"
  ];
  const itamDetailsNestedPages = [
    "manage-ci", "business-service-map", "components", "logon-events",
    "itsm", "relationships", "audits-tab", "sla", "maintenance",
    "vulnerability", "private-properties", "tasks", "history",
    "attachments", "comments"
  ];
  const itamOtherFunctionsPages = ["sync-logs", "tags", "audits"];
  const itamProcurementPages = [
    "requested-items", "purchase-orders", "purchase-order-line-items",
    "receiving-slips", "receiving-slip-lines", "transfer-order"
  ];
  
  // ITAM hierarchy checks
  const isUnderItamConfigurationManagement =
    section === "itam" && (itamConfigurationManagementPages.includes(page) || page === "configuration-management");
  const isUnderItamCmdb =
    section === "itam" && (itamCmdbPages.includes(page) || page === "cmdb");
  const isUnderItamManageCmdb =
    section === "itam" && (itamManageCmdbPages.includes(page) || page === "manage-cmdb");
  const isUnderItamViewEditCi =
    section === "itam" && (itamViewEditCiPages.includes(page) || page === "view-and-edit-ci");
  const isUnderItamCiDetails =
    section === "itam" && (itamCiDetailsPages.includes(page) || page === "ci-details-and-tabs");
  const isUnderItamDetailsNested =
    section === "itam" && (itamDetailsNestedPages.includes(page) || page === "details");
  const isUnderItamOtherFunctions =
    section === "itam" && (itamOtherFunctionsPages.includes(page) || page === "other-functions-and-page-elements");
  const isUnderItamProcurement =
    section === "itam" && (itamProcurementPages.includes(page) || page === "procurement");
  
  // Self Service breadcrumb hierarchy
  const selfServicePages = ["service-catalog", "my-incidents", "my-requests"];
  
  // Program/Project Management breadcrumb hierarchy
  const programProjectManagementPages = ["programs", "projects", "program-dashboard", "project-dashboard"];
  const programsPages = ["program-dashboard"];
  const projectsPages = ["project-dashboard"];
  
  // Risk Register breadcrumb hierarchy
  const riskRegisterPages = ["risk-dashboard", "risks"];
  
  // Reports breadcrumb hierarchy
  const reportsPages = ["ad-hoc-reports", "canned-reports", "properties-and-conditions", "run-report", "delete-report"];
  
  // Vulnerability Management breadcrumb hierarchy
  const vulnerabilityManagementPages = ["core-functionality", "access-vulnerability-management", "view-vulnerability-management", "best-practices", "limitations-and-considerations"];
  
  // Admin breadcrumb hierarchy (using module-level constants declared above)
  
  const isUnderSharedFunctions = section === "application-overview" && (sharedFunctionsPages.includes(page) || page === "shared-functions");
  const isUnderDashboards = section === "my-dashboard" && (dashboardsPages.includes(page) || page === "dashboards");
  const isUnderMyDashboardSection = section === "my-dashboard" && (myDashboardSectionPages.includes(page) && page !== "contents") || page === "my-dashboard-section";
  
  const isUnderManageCmdb = section === "cmdb" && (manageCmdbPages.includes(page) || page === "manage-cmdb");
  const isUnderViewEditCi = section === "cmdb" && (viewEditCiPages.includes(page) || page === "view-and-edit-ci");
  const isUnderCiDetails = section === "cmdb" && (ciDetailsPages.includes(page) || page === "ci-details-and-tabs");
  const isUnderDetailsNested = section === "cmdb" && (detailsNestedPages.includes(page) || page === "details");
  
  const isUnderDashboard = section === "discovery-scan" && (dashboardPages.includes(page) || page === "dashboard");
  const isUnderRunAScan = section === "discovery-scan" && runAScanPages.includes(page);
  const isUnderInitiateConfigure = section === "discovery-scan" && (initiateConfigurePages.includes(page) || page === "initiate-and-configure-discovery-scan");
  const isUnderConfigureDiscovery = section === "discovery-scan" && (configureDiscoveryPages.includes(page) || page === "configure-discovery-scan");
  const isUnderRecentScans = section === "discovery-scan" && (recentScansPages.includes(page) || page === "recent-scans");
  const isUnderViewRecentScan = section === "discovery-scan" && (viewRecentScanPages.includes(page) || page === "view-recent-scan");
  const isUnderRecentScanDetails = section === "discovery-scan" && (recentScanDetailsPages.includes(page) || page === "details");
  const isUnderScheduledScansImports = section === "discovery-scan" && (scheduledScansImportsPages.includes(page) || page === "scheduled-scans-and-imports");
  const isUnderScansImportOptions = section === "discovery-scan" && (scansAndImportOptionsPages.includes(page) || page === "scans-and-import-options");
  const isUnderScheduledImportSetup = section === "discovery-scan" && (scheduledImportSetupPages.includes(page) || page === "scheduled-import-setup");
  const isUnderIpamNetworks = section === "discovery-scan" && (ipamNetworksPages.includes(page) || page === "ipam-networks");
  const isUnderIpamFunctionsOverview = section === "discovery-scan" && (ipamFunctionsOverviewPages.includes(page) || page === "ipam-functions-overview");
  const isUnderScanFunction = section === "discovery-scan" && (scanFunctionPages.includes(page) || page === "scan-function");
  const isUnderDiscoveredItems = section === "discovery-scan" && (discoveredItemsPages.includes(page) || page === "discovered-items");
  const isUnderManageDiscoveredItems = section === "discovery-scan" && (manageDiscoveredItemsPages.includes(page) || page === "manage-discovered-items");
  const isUnderDetailedViewDiscoveredItems = section === "discovery-scan" && (detailedViewDiscoveredItemsPages.includes(page) || page === "detailed-view-of-discovered-items");
  const isUnderOtherFunctionsDiscoveredItems = section === "discovery-scan" && (otherFunctionsDiscoveredItemsPages.includes(page) || page === "other-functions-and-page-elements-discovered-items");
  const isUnderImportFromAWS = section === "discovery-scan" && (importFromAwsPages.includes(page) || page === "import-from-aws");
  const isUnderViewAwsImportRecord = section === "discovery-scan" && (viewAwsImportRecordPages.includes(page) || page === "view-aws-import-record");
  const isUnderImportFromAzure = section === "discovery-scan" && (importFromAzurePages.includes(page) || page === "import-from-azure");
  const isUnderViewAzureImportRecord = section === "discovery-scan" && (viewAzureImportRecordPages.includes(page) || page === "view-azure-import-record");
  const isUnderImportFromMeraki = section === "discovery-scan" && (importFromMerakiPages.includes(page) || page === "import-from-meraki");
  const isUnderViewMerakiImportRecord = section === "discovery-scan" && (viewMerakiImportRecordPages.includes(page) || page === "view-meraki-import-record");
  const isUnderImportFromIntune = section === "discovery-scan" && (importFromIntunePages.includes(page) || page === "import-from-intune");
  const isUnderViewIntuneImportRecord = section === "discovery-scan" && (viewIntuneImportRecordPages.includes(page) || page === "view-intune-import-record");
  const isUnderImportDataFiles = section === "discovery-scan" && (importDataFilesPages.includes(page) || page === "import-data-files");
  const isUnderViewImportedDataFile = section === "discovery-scan" && (viewImportedDataFilePages.includes(page) || page === "view-an-imported-data-file");
  const isUnderImportedAssets = section === "discovery-scan" && (importedAssetsPages.includes(page) || page === "imported-assets");
  const isUnderAdUserImportLogs = section === "discovery-scan" && (adUserImportLogsPages.includes(page) || page === "ad-user-import-logs");
  const isUnderAdConfigurationAndImport = section === "discovery-scan" && (adConfigurationAndImportPages.includes(page) || page === "ad-configuration-and-import");
  const isUnderViewImportLogDetails = section === "discovery-scan" && (viewImportLogDetailsPages.includes(page) || page === "view-import-log-details");
  const isUnderAzureAd = section === "discovery-scan" && (azureAdPages.includes(page) || page === "azure-ad-user-import-logs");
  const isUnderAzureAdConfigurationAndImport = section === "discovery-scan" && (azureAdConfigurationAndImportPages.includes(page) || page === "azure-ad-configuration-and-import");
  const isUnderViewImportLogDetailsAzure = section === "discovery-scan" && (viewImportLogDetailsAzurePages.includes(page) || page === "view-import-log-details-azure");
  
  // ITSM hierarchy checks
  const isUnderConfigurationManagement = section === "itsm" && (configurationManagementPages.includes(page) || page === "configuration-management");
  const isUnderItsmCmdb = section === "itsm" && (itsmCmdbPages.includes(page) || page === "cmdb");
  const isUnderItsmManageCmdb = section === "itsm" && (itsmManageCmdbPages.includes(page) || page === "manage-cmdb");
  const isUnderItsmViewEditCi = section === "itsm" && (itsmViewEditCiPages.includes(page) || page === "view-and-edit-ci");
  const isUnderItsmCiDetails = section === "itsm" && (itsmCiDetailsPages.includes(page) || page === "ci-details-and-tabs");
  const isUnderItsmDetailsNested = section === "itsm" && (itsmDetailsNestedPages.includes(page) || page === "details");
  const isUnderItsmOtherFunctions = section === "itsm" && (itsmOtherFunctionsPages.includes(page) || page === "other-functions-and-page-elements");
  
  // Vulnerability Management hierarchy checks
  const isUnderVulnerabilityManagement = section === "vulnerability-management" && (vulnerabilityManagementPages.includes(page) || page === "vulnerability-management");
  
  // Admin hierarchy checks
  const isUnderOrganizationalDetails = (actualSection === "organizational-details" || section === "admin") && (organizationalDetailsPages.includes(page) || page === "organizational-details");
  const isUnderDepartments = section === "admin" && (departmentsPages.includes(page) || page === "departments");
  
  const isUnderDiscovery = (actualSection === "discovery" || section === "admin") && (discoveryPages.includes(page) || page === "discovery");
  const isUnderClient = section === "admin" && (clientPages.includes(page) || page === "client");
  const isUnderCredentials = section === "admin" && (credentialsPages.includes(page) || page === "credentials");
  const isUnderMonitoringProfile = section === "admin" && (monitoringProfilePages.includes(page) || page === "monitoring-profile");
  
  const isUnderSacm = (actualSection === "sacm" || section === "admin") && (sacmPages.includes(page) || page === "sacm");
  const isUnderUsers = (actualSection === "users" || section === "admin") && (usersPages.includes(page) || page === "users");
  
  const isUnderManagementFunctions = (actualSection === "management-functions" || section === "admin") && (managementFunctionsPages.includes(page) || page === "management-functions");
  const isUnderProcurement = section === "admin" && (procurementPages.includes(page) || page === "procurement");
  
  const isUnderIntegrations = (actualSection === "integrations" || section === "admin") && (integrationsPages.includes(page) || page === "integrations");
  const isUnderCherwellCredential = section === "admin" && (cherwellCredentialPages.includes(page) || page === "cherwell-credential");
  const isUnderIvantiCredentials = section === "admin" && (ivantiCredentialsPages.includes(page) || page === "ivanti-credentials");
  const isUnderJiraCredentials = section === "admin" && (jiraCredentialsPages.includes(page) || page === "jira-credentials");
  const isUnderServicenowCredentials = section === "admin" && (servicenowCredentialsPages.includes(page) || page === "servicenow-credentials");
  
  const isUnderOthers = (actualSection === "others" || section === "admin") && (othersPages.includes(page) || page === "others");
  
  // Self Service hierarchy checks
  const isUnderSelfService = section === "self-service" && (selfServicePages.includes(page) || page === "self-service");
  
  // Program/Project Management hierarchy checks
  const isUnderProgramProjectManagement = section === "program-project-management" && (programProjectManagementPages.includes(page) || page === "program-project-management");
  const isUnderPrograms = section === "program-project-management" && (programsPages.includes(page) || page === "programs");
  const isUnderProjects = section === "program-project-management" && (projectsPages.includes(page) || page === "projects");
  
  // Risk Register hierarchy checks
  const isUnderRiskRegister = section === "risk-register" && (riskRegisterPages.includes(page) || page === "risk-register");
  
  // Reports hierarchy checks
  const isUnderReports = section === "reports" && (reportsPages.includes(page) || page === "reports");
  
  // Application Overview pages (these appear under Application Overview section in my-dashboard module)
  const applicationOverviewPages = [
    "system-icons",
    "user-specific-functions", 
    "online-help",
    ...sharedFunctionsPages,
    "shared-functions" // parent page itself
  ];
  
  // Getting Started pages (universal: works for all modules and versions)
  const gettingStartedPages = ["quick-start", "installation", "configuration", "first-steps"];
  const isGettingStartedPage = gettingStartedPages.includes(page);
  
  // Admin sub-section page detection (using arrays declared above)
  const isOrganizationalDetailsPage = organizationalDetailsPages.includes(page);
  const isDiscoveryPage = discoveryPages.includes(page);
  const isSacmPage = sacmPages.includes(page);
  const isUsersPage = usersPages.includes(page);
  const isManagementFunctionsPage = managementFunctionsPages.includes(page);
  const isIntegrationsPage = integrationsPages.includes(page);
  const isOthersPage = othersPages.includes(page);
  
  // Detect if we're in Application Overview section based on page content
  // Even if URL section is "my-dashboard", if page is an Application Overview page, 
  // we should show "Application Overview" as the section
  const isApplicationOverviewPage = applicationOverviewPages.includes(page);
  
  // Detect actual section: prioritize Getting Started, then Admin sub-sections, then Application Overview, then use provided section
  let actualSection = section;
  if (module === 'my-dashboard' && isGettingStartedPage) {
    actualSection = 'getting-started';
  } else if (module === 'admin' && isOrganizationalDetailsPage) {
    actualSection = 'organizational-details';
  } else if (module === 'admin' && isDiscoveryPage) {
    actualSection = 'discovery';
  } else if (module === 'admin' && isSacmPage) {
    actualSection = 'sacm';
  } else if (module === 'admin' && isUsersPage) {
    actualSection = 'users';
  } else if (module === 'admin' && isManagementFunctionsPage) {
    actualSection = 'management-functions';
  } else if (module === 'admin' && isIntegrationsPage) {
    actualSection = 'integrations';
  } else if (module === 'admin' && isOthersPage) {
    actualSection = 'others';
  } else if (module === 'my-dashboard' && isApplicationOverviewPage) {
    actualSection = 'application-overview';
  }
  
  // Get section display name based on actual section
  const sectionDisplayName = getSectionDisplayName(actualSection);
  
  // Determine parent topic to show after section
  // Important: Only set parentTopic if we're NOT on the parent page itself
  let parentTopic: string | null = null;
  // Application Overview direct pages (system-icons, user-specific-functions, online-help) don't have a parent topic
  // Only Shared Functions pages have "Shared Functions" as parent topic
  if ((actualSection === "application-overview" && sharedFunctionsPages.includes(page)) && page !== "shared-functions") parentTopic = "Shared Functions";
  else if (isUnderDashboards && page !== "dashboards") parentTopic = "Dashboards";
  else if (isUnderManageCmdb && page !== "manage-cmdb") parentTopic = "Manage CMDB";
  else if (isUnderViewEditCi && page !== "view-and-edit-ci") parentTopic = "View and Edit a CI";
  else if (isUnderCiDetails || isUnderDetailsNested) parentTopic = "CI Details and Tabs";
  else if (isUnderDashboard && page !== "dashboard") parentTopic = "Dashboard";
  else if (isUnderRunAScan && page !== "run-a-scan") parentTopic = "Run a Scan";
  else if (isUnderInitiateConfigure && page !== "initiate-and-configure-discovery-scan") parentTopic = "Initiate and Configure Discovery Scan";
  else if (isUnderConfigureDiscovery && page !== "configure-discovery-scan") parentTopic = "Configure Discovery Scan";
  else if (isUnderRecentScans && page !== "recent-scans") parentTopic = "Recent Scans";
  else if (isUnderViewRecentScan && page !== "view-recent-scan") parentTopic = "View Recent Scan";
  else if (isUnderRecentScanDetails && page !== "details") parentTopic = "Details";
  else if (isUnderScheduledScansImports && page !== "scheduled-scans-and-imports") parentTopic = "Scheduled Scans and Imports";
  else if (isUnderScansImportOptions && page !== "scans-and-import-options") parentTopic = "Scans and Import Options";
  else if (isUnderScheduledImportSetup && page !== "scheduled-import-setup") parentTopic = "Scheduled Import Setup";
  else if (isUnderIpamNetworks && page !== "ipam-networks") parentTopic = "IPAM Networks";
  else if (isUnderIpamFunctionsOverview && page !== "ipam-functions-overview") parentTopic = "IPAM Functions Overview";
  else if (isUnderScanFunction && page !== "scan-function") parentTopic = "Scan Function";
  else if (isUnderDiscoveredItems && page !== "discovered-items") parentTopic = "Discovered Items";
  else if (isUnderManageDiscoveredItems && page !== "manage-discovered-items") parentTopic = "Manage Discovered Items";
  else if (isUnderDetailedViewDiscoveredItems && page !== "detailed-view-of-discovered-items") parentTopic = "Detailed View of Discovered Items";
  else if (isUnderOtherFunctionsDiscoveredItems && page !== "other-functions-and-page-elements-discovered-items") parentTopic = "Other Functions and Page Elements";
  else if (isUnderImportFromAWS && page !== "import-from-aws") parentTopic = "Import from AWS";
  else if (isUnderViewAwsImportRecord && page !== "view-aws-import-record") parentTopic = "View AWS Import Record";
  else if (isUnderImportFromAzure && page !== "import-from-azure") parentTopic = "Import from Azure";
  else if (isUnderViewAzureImportRecord && page !== "view-azure-import-record") parentTopic = "View AZURE Import Record";
  else if (isUnderImportFromMeraki && page !== "import-from-meraki") parentTopic = "Import from Meraki";
  else if (isUnderViewMerakiImportRecord && page !== "view-meraki-import-record") parentTopic = "View Meraki Import Record";
  else if (isUnderImportFromIntune && page !== "import-from-intune") parentTopic = "Import from Intune";
  else if (isUnderViewIntuneImportRecord && page !== "view-intune-import-record") parentTopic = "View Intune Import Record";
  else if (isUnderImportDataFiles && page !== "import-data-files") parentTopic = "Import Data Files";
  else if (isUnderViewImportedDataFile && page !== "view-an-imported-data-file") parentTopic = "View an Imported Data File";
  else if (isUnderImportedAssets && page !== "imported-assets") parentTopic = "Imported Assets";
  else if (isUnderAdUserImportLogs && page !== "ad-user-import-logs") parentTopic = "AD User Import Logs";
  else if (isUnderAdConfigurationAndImport && page !== "ad-configuration-and-import") parentTopic = "AD Configuration and Import";
  else if (isUnderViewImportLogDetails && page !== "view-import-log-details") parentTopic = "View Import Log Details";
  else if (isUnderAzureAd && page !== "azure-ad-user-import-logs") parentTopic = "Azure AD User Import Logs";
  else if (isUnderAzureAdConfigurationAndImport && page !== "azure-ad-configuration-and-import") parentTopic = "Azure AD Configuration and Import";
  else if (isUnderViewImportLogDetailsAzure && page !== "view-import-log-details-azure") parentTopic = "View Import Log Details";
  else if (isUnderConfigurationManagement && page !== "configuration-management") parentTopic = "Configuration Management";
  else if (isUnderOrganizationalDetails && page !== "organizational-details") parentTopic = "Organizational Details";
  else if (isUnderDiscovery && page !== "discovery") parentTopic = "Discovery";
  else if (isUnderSacm && page !== "sacm") parentTopic = "SACM";
  else if (isUnderUsers && page !== "users") parentTopic = "Users";
  else if (isUnderManagementFunctions && page !== "management-functions") parentTopic = "Management Functions";
  else if (isUnderIntegrations && page !== "integrations") parentTopic = "Integrations";
  else if (isUnderOthers && page !== "others") parentTopic = "Others";
  else if (isUnderSelfService && page !== "self-service") parentTopic = "Self Service";
  else if (isUnderProgramProjectManagement && page !== "program-project-management") parentTopic = "Program/Project Management";
  else if (isUnderRiskRegister && page !== "risk-register") parentTopic = "Risk Register";
  else if (isUnderReports && page !== "reports") parentTopic = "Reports";
  else if (isUnderVulnerabilityManagement && page !== "vulnerability-management") parentTopic = "Vulnerability Management";

  // Format page name for display using TOC label lookup
  const pageDisplayName = getPageLabel(page);

  return (
    <article className="prose prose-slate max-w-none -mt-9">
      <div className="flex flex-col gap-3 mb-8 not-prose">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={onHomeClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onVersionClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {version}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={onModuleClick}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {moduleNames[module] || module}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => {
                  // Navigate to section (first page of the section)
                  if (onPageClick) {
                    // Get the first page of the section based on module and actual section
                    let firstPage = '';
                    if (actualSection === 'getting-started') {
                      firstPage = 'quick-start';
                    } else if (actualSection === 'application-overview') {
                      firstPage = 'system-icons';
                    } else if (actualSection === 'organizational-details') {
                      firstPage = 'organizational-details';
                    } else if (actualSection === 'discovery') {
                      firstPage = 'application-map';
                    } else if (actualSection === 'sacm') {
                      firstPage = 'blueprints';
                    } else if (actualSection === 'users') {
                      firstPage = 'ad-configuration';
                    } else if (actualSection === 'management-functions') {
                      firstPage = 'change-management';
                    } else if (actualSection === 'integrations') {
                      firstPage = 'cherwell-credential';
                    } else if (actualSection === 'others') {
                      firstPage = 'announcements';
                    } else if (module === 'my-dashboard' && actualSection === 'my-dashboard') {
                      firstPage = 'my-dashboard-overview';
                    } else if (module === 'cmdb' && actualSection === 'cmdb') {
                      firstPage = 'access-cmdb';
                    } else if (module === 'discovery-scan' && actualSection === 'discovery-scan') {
                      firstPage = 'access-dashboard';
                    } else {
                      firstPage = 'advanced-search';
                    }
                    onPageClick(version, module, actualSection, firstPage);
                  }
                }}
                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
              >
                {sectionDisplayName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {parentTopic && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleParentTopicClick(parentTopic)}
                    className="text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors"
                  >
                    {parentTopic}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            {/* My Dashboard nested hierarchy */}
            {isUnderMyDashboardSection && page !== "my-dashboard-section" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("My Dashboard", "my-dashboard-section")}>
                    My Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - Manage CMDB */}
            {isUnderManageCmdb && page !== "manage-cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - View and Edit a CI */}
            {isUnderViewEditCi && page !== "view-and-edit-ci" && !isUnderCiDetails && !isUnderDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - CI Details and Tabs */}
            {(isUnderCiDetails || isUnderDetailsNested) && page !== "ci-details-and-tabs" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* CMDB nested hierarchy - Details */}
            {isUnderDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Run a Scan hierarchy */}
            {isUnderInitiateConfigure && page !== "initiate-and-configure-discovery-scan" && !isUnderConfigureDiscovery && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderConfigureDiscovery && page !== "configure-discovery-scan" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configure Discovery Scan", "configure-discovery-scan")}>
                    Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {page === "configure-discovery-scan" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Initiate and Configure Discovery Scan", "initiate-and-configure-discovery-scan")}>
                    Initiate and Configure Discovery Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Recent Scans hierarchy */}
            {isUnderViewRecentScan && page !== "view-recent-scan" && !isUnderRecentScanDetails && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderRecentScanDetails && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleNestedTopicClick("Details", "details")}
                    className="text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors"
                  >
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {page === "details" && section === "discovery-scan" && isUnderViewRecentScan && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Recent Scan", "view-recent-scan")}>
                    View Recent Scan
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Azure AD User Import Logs hierarchy */}
            {isUnderAzureAd && page !== "azure-ad-user-import-logs" && !isUnderAzureAdConfigurationAndImport && !isUnderViewImportLogDetailsAzure && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderAzureAdConfigurationAndImport && page !== "azure-ad-configuration-and-import" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD Configuration and Import", "azure-ad-configuration-and-import")}>
                    Azure AD Configuration and Import
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportLogDetailsAzure && page !== "view-import-log-details-azure" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Azure AD User Import Logs", "azure-ad-user-import-logs")}>
                    Azure AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Import Log Details", "view-import-log-details-azure")}>
                    View Import Log Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Scheduled Scans and Imports hierarchy */}
            {isUnderScansImportOptions && page !== "scans-and-import-options" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Scans and Import Options", "scans-and-import-options")}>
                    Scans and Import Options
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Dashboard hierarchy */}
            {isUnderDashboard && page !== "dashboard" && !isUnderRunAScan && !isUnderRecentScans && !isUnderScheduledScansImports && !isUnderIpamNetworks && !isUnderDiscoveredItems && !isUnderImportFromAWS && !isUnderImportFromAzure && !isUnderImportFromMeraki && !isUnderImportFromIntune && !isUnderImportDataFiles && !isUnderImportedAssets && !isUnderAdUserImportLogs && !isUnderAzureAd && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Dashboard", "dashboard")}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - IPAM Networks hierarchy */}
            {isUnderIpamNetworks && page !== "ipam-networks" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderIpamFunctionsOverview && page !== "ipam-functions-overview" && !isUnderScanFunction && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Functions Overview", "ipam-functions-overview")}>
                    IPAM Functions Overview
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderScanFunction && page !== "scan-function" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Networks", "ipam-networks")}>
                    IPAM Networks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("IPAM Functions Overview", "ipam-functions-overview")}>
                    IPAM Functions Overview
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Scan Function", "scan-function")}>
                    Scan Function
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Discovered Items hierarchy */}
            {isUnderManageDiscoveredItems && page !== "manage-discovered-items" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage Discovered Items", "manage-discovered-items")}>
                    Manage Discovered Items
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderDetailedViewDiscoveredItems && page !== "detailed-view-of-discovered-items" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Detailed View of Discovered Items", "detailed-view-of-discovered-items")}>
                    Detailed View of Discovered Items
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderOtherFunctionsDiscoveredItems && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from AWS hierarchy */}
            {isUnderImportFromAWS && page !== "import-from-aws" && !isUnderViewAwsImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from AWS", "import-from-aws")}>
                    Import from AWS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewAwsImportRecord && page !== "view-aws-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from AWS", "import-from-aws")}>
                    Import from AWS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View AWS Import Record", "view-aws-import-record")}>
                    View AWS Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Azure hierarchy */}
            {isUnderImportFromAzure && page !== "import-from-azure" && !isUnderViewAzureImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Azure", "import-from-azure")}>
                    Import from Azure
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewAzureImportRecord && page !== "view-azure-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Azure", "import-from-azure")}>
                    Import from Azure
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View AZURE Import Record", "view-azure-import-record")}>
                    View AZURE Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Meraki hierarchy */}
            {isUnderImportFromMeraki && page !== "import-from-meraki" && !isUnderViewMerakiImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Meraki", "import-from-meraki")}>
                    Import from Meraki
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewMerakiImportRecord && page !== "view-meraki-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Meraki", "import-from-meraki")}>
                    Import from Meraki
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Meraki Import Record", "view-meraki-import-record")}>
                    View Meraki Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import from Intune hierarchy */}
            {isUnderImportFromIntune && page !== "import-from-intune" && !isUnderViewIntuneImportRecord && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Intune", "import-from-intune")}>
                    Import from Intune
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewIntuneImportRecord && page !== "view-intune-import-record" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import from Intune", "import-from-intune")}>
                    Import from Intune
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Intune Import Record", "view-intune-import-record")}>
                    View Intune Import Record
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Import Data Files hierarchy */}
            {isUnderImportDataFiles && page !== "import-data-files" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import Data Files", "import-data-files")}>
                    Import Data Files
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportedDataFile && page !== "view-an-imported-data-file" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Import Data Files", "import-data-files")}>
                    Import Data Files
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View an Imported Data File", "view-an-imported-data-file")}>
                    View an Imported Data File
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - Imported Assets hierarchy */}
            {isUnderImportedAssets && page !== "imported-assets" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Imported Assets", "imported-assets")}>
                    Imported Assets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Discovery Scan - AD User Import Logs hierarchy */}
            {isUnderAdUserImportLogs && page !== "ad-user-import-logs" && !isUnderAdConfigurationAndImport && !isUnderViewImportLogDetails && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderAdConfigurationAndImport && page !== "ad-configuration-and-import" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD Configuration and Import", "ad-configuration-and-import")}>
                    AD Configuration and Import
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderViewImportLogDetails && page !== "view-import-log-details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("AD User Import Logs", "ad-user-import-logs")}>
                    AD User Import Logs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View Import Log Details", "view-import-log-details")}>
                    View Import Log Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Configuration Management hierarchy */}
            {isUnderConfigurationManagement && page !== "configuration-management" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configuration Management", "configuration-management")}>
                    Configuration Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - CMDB level (show for all CMDB pages under Configuration Management, including manage-cmdb) */}
            {isUnderItsmCmdb && page !== "cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CMDB", "cmdb")}>
                    CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Manage CMDB level (show for manage-cmdb page and its child pages) */}
            {isUnderItsmManageCmdb && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {page !== "manage-cmdb" && <BreadcrumbSeparator />}
              </>
            )}
            {/* ITSM - View and Edit a CI level (nested under CMDB) */}
            {isUnderItsmViewEditCi && page !== "view-and-edit-ci" && !isUnderItsmCiDetails && !isUnderItsmOtherFunctions && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - CI Details and Tabs level (nested under View and Edit a CI) */}
            {isUnderItsmCiDetails && page !== "ci-details-and-tabs" && !isUnderItsmDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Details nested level (nested under CI Details and Tabs) */}
            {isUnderItsmDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITSM - Other Functions and Page Elements level (nested under CMDB) */}
            {isUnderItsmOtherFunctions && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Configuration Management hierarchy */}
            {(section === "itam" && (itamConfigurationManagementPages.includes(page) || page === "configuration-management")) && page !== "configuration-management" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Configuration Management", "configuration-management")}>
                    Configuration Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - CMDB level (show for all CMDB pages under Configuration Management, including manage-cmdb) */}
            {isUnderItamCmdb && page !== "cmdb" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CMDB", "cmdb")}>
                    CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Manage CMDB level (show for manage-cmdb page and its child pages) */}
            {isUnderItamManageCmdb && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Manage CMDB", "manage-cmdb")}>
                    Manage CMDB
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {page !== "manage-cmdb" && <BreadcrumbSeparator />}
              </>
            )}
            {/* ITAM - View and Edit a CI level (nested under CMDB) */}
            {isUnderItamViewEditCi && page !== "view-and-edit-ci" && !isUnderItamCiDetails && !isUnderItamOtherFunctions && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - CI Details and Tabs level (nested under View and Edit a CI) */}
            {isUnderItamCiDetails && page !== "ci-details-and-tabs" && !isUnderItamDetailsNested && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Details nested level (nested under CI Details and Tabs) */}
            {isUnderItamDetailsNested && page !== "details" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("View and Edit a CI", "view-and-edit-ci")}>
                    View and Edit a CI
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("CI Details and Tabs", "ci-details-and-tabs")}>
                    CI Details and Tabs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Details", "details")}>
                    Details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Other Functions and Page Elements level (nested under CMDB) */}
            {isUnderItamOtherFunctions && page !== "other-functions-and-page-elements" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Other Functions and Page Elements", "other-functions-and-page-elements")}>
                    Other Functions and Page Elements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* ITAM - Procurement hierarchy */}
            {isUnderItamProcurement && page !== "procurement" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Procurement", "procurement")}>
                    Procurement
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {/* Admin nested hierarchy */}
            {isUnderDepartments && page !== "departments" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Departments", "departments")}>
                    Departments
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderClient && page !== "client" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Client", "client")}>
                    Client
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderCredentials && page !== "credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Credentials", "credentials")}>
                    Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderProcurement && page !== "procurement" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Procurement", "procurement")}>
                    Procurement
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderCherwellCredential && page !== "cherwell-credential" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Cherwell Credential", "cherwell-credential")}>
                    Cherwell Credential
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderIvantiCredentials && page !== "ivanti-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Ivanti Credentials", "ivanti-credentials")}>
                    Ivanti Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderJiraCredentials && page !== "jira-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("Jira Credentials", "jira-credentials")}>
                    Jira Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {isUnderServicenowCredentials && page !== "servicenow-credentials" && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink {...getClickableBreadcrumbProps("ServiceNow Credentials", "servicenow-credentials")}>
                    ServiceNow Credentials
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900">
                {pageDisplayName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-slate-900 mb-6">
        {page
          .split("-")
          .map(
            (word) =>
              word.toLowerCase() === "cmdb"
                ? "CMDB"
                : word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(" ")}
      </h1>

      <p className="text-slate-600 leading-relaxed mb-12">
        This section contains detailed documentation for{" "}
        {page.replace(/-/g, " ")} in the {moduleName} module.
        The content is maintained in MDX format for easy updates
        and version control.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12 not-prose">
        <p className="text-sm text-blue-900">
          <strong>MDX Content Source:</strong>{" "}
          <code className="text-xs bg-blue-100 px-2 py-1 rounded">
            /content/{version}/{module}/{page}.mdx
          </code>
        </p>
      </div>

      <h2 id="overview" className="mt-12 mb-6">
        Overview
      </h2>
      <p className="text-slate-600 leading-relaxed">
        This page provides comprehensive information about{" "}
        {page.replace(/-/g, " ")} in {moduleName} for Virima
        version {version}. Use the navigation menu to explore
        related topics and other sections of the documentation.
      </p>

      <h2 id="key-topics" className="mt-12 mb-6">
        Key Topics
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>
          Understanding the fundamentals and core concepts
        </li>
        <li>Step-by-step configuration and setup guide</li>
        <li>Best practices and recommended approaches</li>
        <li>Common issues and troubleshooting steps</li>
        <li>Advanced features and customization options</li>
      </ul>

      <h2 id="example-configuration" className="mt-12 mb-6">
        Example Configuration
      </h2>
      <p className="text-slate-600 leading-relaxed mb-6">
        Sample configuration and code snippets:
      </p>

      <div className="bg-slate-900 text-slate-100 p-6 rounded-lg text-sm font-mono not-prose mb-12 overflow-x-auto">
        <pre>{`// Example configuration for ${moduleName}
{
  "version": "${version}",
  "module": "${module}",
  "section": "${section}",
  "page": "${page}",
  "enabled": true,
  "settings": {
    "autoSync": true,
    "interval": 3600,
    "notifications": {
      "email": true,
      "sms": false
    }
  }
}`}</pre>
      </div>

      <h2 id="additional-resources" className="mt-12 mb-6">
        Additional Resources
      </h2>
      <ul className="space-y-2 text-slate-600">
        <li>
          Related documentation sections and cross-references
        </li>
        <li>Video tutorials and training webinars</li>
        <li>Community forums and user discussions</li>
        <li>Knowledge base articles and FAQs</li>
        <li>Support resources and contact information</li>
      </ul>
    </article>
  );
}