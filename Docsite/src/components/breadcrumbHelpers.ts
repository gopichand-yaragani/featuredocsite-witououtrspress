/**
 * Helper functions for breadcrumb navigation
 * Ensures all breadcrumb items are clickable (enterprise documentation standard)
 */

export function makeBreadcrumbClickable(
  topicName: string,
  pageId: string,
  onClick: (pageId: string) => void
): {
  onClick: () => void;
  className: string;
} {
  return {
    onClick: () => onClick(pageId),
    className: "text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors",
  };
}

export function getNestedTopicPageId(topicName: string): string {
  const topicMap: Record<string, string> = {
    "My Dashboard": "my-dashboard-section",
    "Details": "details",
    "Initiate and Configure Discovery Scan": "initiate-and-configure-discovery-scan",
    "Configure Discovery Scan": "configure-discovery-scan",
    "View Recent Scan": "view-recent-scan",
    "View Import Log Details": "view-import-log-details",
    "Scans and Import Options": "scans-and-import-options",
    "IPAM Functions Overview": "ipam-functions-overview",
    "Scan Function": "scan-function",
    "Manage Discovered Items": "manage-discovered-items",
    "Detailed View of Discovered Items": "detailed-view-of-discovered-items",
    "Other Functions and Page Elements": "other-functions-and-page-elements",
    "Manage Import Data Files": "manage-import-data-files",
    "View an Imported Data File": "view-an-imported-data-file",
    "CMDB": "cmdb",
    "View and Edit a CI": "view-and-edit-ci",
    "CI Details and Tabs": "ci-details-and-tabs",
    "Departments": "departments",
    "Client": "client",
    "Credentials": "credentials",
    "Procurement": "procurement",
    "Cherwell Credential": "cherwell-credential",
    "Ivanti Credentials": "ivanti-credentials",
    "Jira Credentials": "jira-credentials",
    "ServiceNow Credentials": "servicenow-credentials",
  };
  return topicMap[topicName] || topicName.toLowerCase().replace(/\s+/g, "-");
}

