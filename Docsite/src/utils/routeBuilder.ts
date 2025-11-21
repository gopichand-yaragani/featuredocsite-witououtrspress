interface RouteParams {
  version: string;
  module: string;
  section: string;
  page: string;
}

const formatVersionPath = (version: string, useUnderscoreFormat: boolean) => {
  if (useUnderscoreFormat) {
    if (version === "6.1") return "6_1";
    if (version === "6.1.1") return "6_1_1";
    if (version === "5.13") return "5_13";
    return "NextGen";
  }

  if (version === "6.1") return "6.1";
  if (version === "6.1.1") return "6.1.1";
  if (version === "5.13") return "5.13";
  return "NextGen";
};

const adminPageToFileMap: Record<
  string,
  { file: string; subfolder?: string }
> = {
  // Organizational Details
  "cost-center": { file: "cost_center_6_1", subfolder: "admin_org_details" },
  departments: { file: "departments_6_1", subfolder: "admin_org_details" },
  members: { file: "departments_members_6_1", subfolder: "admin_org_details" },
  designations: { file: "designations_6_1", subfolder: "admin_org_details" },
  holidays: { file: "holidays_6_1", subfolder: "admin_org_details" },
  locations: { file: "locations_6_1", subfolder: "admin_org_details" },
  "operational-hours": {
    file: "operational_hours_6_1",
    subfolder: "admin_org_details",
  },
  "organizational-details-nested": {
    file: "organizational_details_6_1",
    subfolder: "admin_org_details",
  },
  "organizational-details": {
    file: "about_org_details_6_1",
    subfolder: "admin_org_details",
  },
  // Discovery
  "application-map": { file: "application_map_6_1", subfolder: "admin_discovery" },
  client: { file: "client_6_1", subfolder: "admin_discovery" },
  "discovery-agents": {
    file: "client_discovery_agents_6_1",
    subfolder: "admin_discovery",
  },
  "remote-install": {
    file: "client_remote_install_6_1",
    subfolder: "admin_discovery",
  },
  "restart-client": { file: "client_restart_6_1", subfolder: "admin_discovery" },
  correlation: { file: "correlation_6_1", subfolder: "admin_discovery" },
  credentials: { file: "credentials_6_1", subfolder: "admin_discovery" },
  details: { file: "credentials_details_6_1", subfolder: "admin_discovery" },
  "backup-file": { file: "credentials_backup_file_6_1", subfolder: "admin_discovery" },
  "flush-credential": { file: "credentials_flush_6_1", subfolder: "admin_discovery" },
  "download-application": {
    file: "downloading_discovery_6_1",
    subfolder: "admin_discovery",
  },
  "import-templates": { file: "import_templates_6_1", subfolder: "admin_discovery" },
  "ignore-adm-process": { file: "ignore_adm_process_6_1", subfolder: "admin_discovery" },
  "ignore-process": { file: "ignore_process_6_1", subfolder: "admin_discovery" },
  "major-software": { file: "major_software_6_1", subfolder: "admin_discovery" },
  "monitoring-profile": { file: "mon_prof_6_1", subfolder: "admin_discovery" },
  "action-details": {
    file: "mon_prof_action_details_6_1",
    subfolder: "admin_discovery",
  },
  frequency: { file: "mon_prof_frequency_6_1", subfolder: "admin_discovery" },
  notifications: { file: "mon_prof_notifications_6_1", subfolder: "admin_discovery" },
  "trigger-conditions": {
    file: "mon_prof_trigger_conditions_6_1",
    subfolder: "admin_discovery",
  },
  patterns: { file: "patterns_6_1", subfolder: "admin_discovery" },
  "port-configuration": { file: "port_config_process_6_1", subfolder: "admin_discovery" },
  "probe-workflow": { file: "probe_workflow_6_1", subfolder: "admin_discovery" },
  probes: { file: "probes_6_1", subfolder: "admin_discovery" },
  "scan-configuration": { file: "scan_configuration_6_1", subfolder: "admin_discovery" },
  sensors: { file: "sensors_6_1", subfolder: "admin_discovery" },
  // SACM
  blueprints: { file: "blueprints_6_1", subfolder: "admin_sacm" },
  "bsm-views": { file: "custom_bsm_views_6_1", subfolder: "admin_sacm" },
  "cmdb-graphical-workflow": {
    file: "cmdb_graphical_workflow_6_1",
    subfolder: "admin_sacm",
  },
  "cmdb-properties": { file: "cmdb_properties_6_1", subfolder: "admin_sacm" },
  "confidence-configuration": {
    file: "confidence_config_6_1",
    subfolder: "admin_sacm",
  },
  "duplicates-remediation": { file: "dups_remediation_6_1", subfolder: "admin_sacm" },
  "export-ci-template": { file: "export_ci_template_6_1", subfolder: "admin_sacm" },
  "ip-connection-score-threshold": {
    file: "ip_conn_score_threshold_6_1",
    subfolder: "admin_sacm",
  },
  "process-tags": { file: "process_tags_6_1", subfolder: "admin_sacm" },
  "property-group": { file: "property_group_6_1", subfolder: "admin_sacm" },
  "relationship-types": { file: "relationship_types_6_1", subfolder: "admin_sacm" },
  "software-license-validity-check": {
    file: "software_lic_validity_check_6_1",
    subfolder: "admin_sacm",
  },
  "software-usage-report": { file: "software_usage_report_6_1", subfolder: "admin_sacm" },
  // Users
  "ad-configuration": { file: "ad_imp_auth_6_1", subfolder: "admin_users" },
  "azure-ad-configuration": { file: "azure_ad_config_6_1", subfolder: "admin_users" },
  "saml-configuration": { file: "saml_config_6_1", subfolder: "admin_users" },
  "time-track-reports": { file: "time_track_reports_6_1", subfolder: "admin_users" },
  "user-groups": { file: "user_groups_6_1", subfolder: "admin_users" },
  "user-roles": { file: "user_roles_6_1", subfolder: "admin_users" },
  "users-list": { file: "users_6_1", subfolder: "admin_users" },
  // Management Functions
  "change-management": {
    file: "about_change_mngmnt_6_1",
    subfolder: "admin_change_mngmnt",
  },
  "contract-management": {
    file: "about_contract_mngmnt_6_1",
    subfolder: "admin_contract_mngmt",
  },
  "event-management": {
    file: "about_event_mngmnt_6_1",
    subfolder: "admin_event_mngmnt",
  },
  "hardware-asset-management": {
    file: "hardware_asset_mngmnt_6_1",
    subfolder: "admin_hardware_asset_mngmnt",
  },
  "incident-management": {
    file: "about_incident_mngmnt_6_1",
    subfolder: "admin_incident_mngmnt",
  },
  "knowledge-management": {
    file: "about_knowledge_mngmnt_6_1",
    subfolder: "admin_knowledge_mngmnt",
  },
  "problem-management": {
    file: "about_problem_mngmnt_6_1",
    subfolder: "admin_problem_mngmnt",
  },
  "about-procurement": { file: "about_procurement_6_1", subfolder: "admin_procurement" },
  "procurement-properties": {
    file: "procurement_properties_6_1",
    subfolder: "admin_procurement",
  },
  "procurement-property-group": {
    file: "procurement_property_group_6_1",
    subfolder: "admin_procurement",
  },
  "project-management": { file: "about_project_mngmnt_6_1", subfolder: "admin_project_mngmnt" },
  "release-management": { file: "about_release_mngmnt_6_1", subfolder: "admin_release_mngmnt" },
  "request-management": { file: "about_request_mngmnt_6_1", subfolder: "admin_request_mngmnt" },
  "vendor-management": { file: "about_vendor_mngmnt_6_1", subfolder: "admin_vendor_mngmnt" },
  // Integrations
  "cherwell-credential": { file: "cherwell_credential_6_1", subfolder: "admin_integrations" },
  "cherwell-mappings": { file: "cherwell_mappings_6_1", subfolder: "admin_integrations" },
  "infoblox-configuration": { file: "infoblox_config_6_1", subfolder: "admin_integrations" },
  "ivanti-credentials": { file: "ivanti_credentials_6_1", subfolder: "admin_integrations" },
  "ivanti-mappings": { file: "ivanti_mappings_6_1", subfolder: "admin_integrations" },
  "jira-credentials": { file: "jira_credentials_6_1", subfolder: "admin_integrations" },
  "jira-asset-mappings": { file: "jira_mappings_6_1", subfolder: "admin_integrations" },
  "servicenow-credentials": {
    file: "servicenow_credentials_6_1",
    subfolder: "admin_integrations",
  },
  "servicenow-mappings": { file: "servicenow_mappings_6_1", subfolder: "admin_integrations" },
  // Others
  announcements: { file: "announcements_6_1", subfolder: "admin_other" },
  "business-rules": { file: "business_rules_6_1", subfolder: "admin_other" },
  "custom-reports": { file: "custom_reports_6_1", subfolder: "admin_other" },
  "documentation-and-tester": {
    file: "documentation_tester_6_1",
    subfolder: "admin_other",
  },
  "inbox-configuration-itsm": {
    file: "inbox_config_itsm_ticket_mngmnt_6_1",
    subfolder: "admin_other",
  },
  kpis: { file: "kpis_6_1", subfolder: "admin_other" },
  reports: { file: "reports_6_1", subfolder: "admin_other" },
  "role-access": { file: "role_access_6_1", subfolder: "admin_other" },
  "service-level-agreements": { file: "sla_6_1", subfolder: "admin_other" },
  "smtp-configuration": { file: "smtp_config_6_1", subfolder: "admin_other" },
  "risk-score-calculator": { file: "risk_score_calculator_6_1", subfolder: "admin_other" },
  "graphical-workflows": { file: "graphical_workflows_6_1", subfolder: "admin_other" },
};

const useNewFormatModules = new Set([
  "my-dashboard",
  "itsm",
  "vulnerability-management",
  "itam",
  "self-service",
  "program-project-management",
  "risk-register",
  "reports",
  "admin",
]);

export function buildRoutePath({
  version,
  module,
  section,
  page,
}: RouteParams): string {
  if (!module) {
    return "/";
  }

  const useNewFormat = version === "6.1";
  const versionPath = formatVersionPath(version, useNewFormat);

  if (useNewFormat && useNewFormatModules.has(module)) {
    const folderMap: Record<string, string> = {
      "my-dashboard": "my-dashboard-6_1",
      cmdb: "cmdb_6_1",
      "discovery-scan": "discovery_scan_6_1",
      "application-overview": "application_overview_6_1",
      itsm: "itam_6_1",
      itam: "itam_6_1",
      "vulnerability-management": "vulnerability_management-6_1",
      "self-service": "self-service-6_1",
      "program-project-management": "program-project-management-6_1",
      "risk-register": "risk-register-6_1",
      reports: "reports_6_1",
      admin: "admin_6_1",
    };
    const moduleFolder = folderMap[module] || module;

    if (module === "self-service") {
      const fileName = `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "program-project-management") {
      const fileName = `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "risk-register") {
      const fileName = `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "reports") {
      const pageToFileMap: Record<string, string> = {
        "ad-hoc-reports": "reports_ad_hoc_6_1",
        "canned-reports": "reports_canned_6_1",
        "properties-and-conditions": "reports_props_conds_6_1",
        "run-report": "reports_run_6_1",
        "delete-report": "reports_delete_6_1",
      };
      const fileName =
        pageToFileMap[page] || `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "admin") {
      const pageInfo = adminPageToFileMap[page];
      if (pageInfo) {
        if (pageInfo.subfolder) {
          return `/${versionPath}/${moduleFolder}/${pageInfo.subfolder}/${pageInfo.file}`;
        }
        return `/${versionPath}/${moduleFolder}/${pageInfo.file}`;
      }

      const fileName = `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "vulnerability-management") {
      const fileName = `${page.replace(/-/g, "_")}_6_1`;
      return `/${versionPath}/${moduleFolder}/${fileName}`;
    }

    if (module === "itsm" && section === "itsm") {
      const itsmCmdbPages = new Set([
        "access-cmdb",
        "manage-cmdb",
        "audits",
        "change-attributes",
        "delete",
        "export",
        "new",
        "copy-to-ivanti",
        "copy-to-jira",
        "copy-to-servicenow",
        "generate-installed-software-report",
        "process-adm",
        "process-available-patch-report",
        "process-cloud-hierarchy",
        "process-devops",
        "process-missing-components",
        "process-network-connection",
        "process-software-installation",
        "ci-left-panel",
        "contacts-on-ci",
        "ci-details-and-tabs",
        "details",
        "manage-ci",
        "business-service-map",
        "components",
        "logon-events",
        "itsm-tab",
        "relationships",
        "audits-tab",
        "sla",
        "maintenance",
        "vulnerability",
        "private-properties",
        "tasks",
        "history",
        "attachments",
        "comments",
        "other-functions-and-page-elements",
        "sync-logs",
        "tags",
      ]);

      if (itsmCmdbPages.has(page)) {
        const fileName = `${page.replace(/-/g, "_")}_6_1`;
        return `/${versionPath}/${moduleFolder}/cmdb_6_1/${fileName}`;
      }
    }

    const myDashboardFileMap: Record<string, string> = {
      "my-dashboard-overview": "my-dashboard-overview-6_1",
      dashboards: "dashboards-6_1",
      "dashboards-contents": "dashboards-contents-6_1",
      customization: "dashboards-customization-6_1",
      "report-actions": "dashboards-report-actions-6_1",
      "system-icons": "system-icons-6_1",
    };

    const fileName =
      myDashboardFileMap[page] || `${page.replace(/-/g, "_")}_6_1`;
    return `/${versionPath}/${moduleFolder}/${fileName}`;
  }

  const sectionPath = section ? `/${section}` : "";
  const pagePath = page ? `/${page}` : "";
  return `/${versionPath}/${module}${sectionPath}${pagePath}`;
}


