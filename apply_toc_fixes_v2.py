import os
import re
from pathlib import Path

# Paths
base_path = Path(r"C:\Users\GopichandY\github\FeatureDocsite\src\content\6_1")
index_file = base_path / "index.mdx"

# Define the fixes - mapping old paths to new paths
fixes = {
    # My Dashboard - fix directory name from my-dashboard-6_1 to my_dashboard_6_1
    '/6_1/my-dashboard-6_1/my-dashboard-overview-6_1': '/6_1/my_dashboard_6_1/my-dashboard-overview-6_1',
    '/6_1/my-dashboard-6_1/dashboards-6_1': '/6_1/my_dashboard_6_1/dashboards-6_1',
    '/6_1/my-dashboard-6_1/dashboards-contents-6_1': '/6_1/my_dashboard_6_1/dashboards-contents-6_1',
    '/6_1/my-dashboard-6_1/dashboards-customization-6_1': '/6_1/my_dashboard_6_1/dashboards-customization-6_1',
    '/6_1/my-dashboard-6_1/my-dashboard-6_1': '/6_1/my_dashboard_6_1/my-dashboard-6_1',
    '/6_1/my-dashboard-6_1/my-dashboard-contents-6_1': '/6_1/my_dashboard_6_1/my-dashboard-contents-6_1',
    '/6_1/my-dashboard-6_1/dashboards-report-actions-6_1': '/6_1/my_dashboard_6_1/dashboards-report-actions-6_1',
    '/6_1/my-dashboard-6_1/system-icons-6_1': '/6_1/my_dashboard_6_1/system-icons-6_1',
    
    # Vulnerability Management - fix directory name from vulnerability_management-6_1 to vulnerability_management_6_1
    '/6_1/vulnerability_management-6_1/core_functionality_6_1': '/6_1/vulnerability_management_6_1/core_functionality_6_1',
    '/6_1/vulnerability_management-6_1/access_vulnerability_management_6_1': '/6_1/vulnerability_management_6_1/access_vulnerability_management_6_1',
    '/6_1/vulnerability_management-6_1/view_vulnerability_management_6_1': '/6_1/vulnerability_management_6_1/view_vulnerability_management_6_1',
    '/6_1/vulnerability_management-6_1/best_practices_6_1': '/6_1/vulnerability_management_6_1/best_practices_6_1',
    '/6_1/vulnerability_management-6_1/limitations_considerations_6_1': '/6_1/vulnerability_management_6_1/limitations_considerations_6_1',
    
    # Self Service - fix directory name from self-service-6_1 to self_service_6_1
    '/6_1/self-service-6_1/service_catalog_6_1': '/6_1/self_service_6_1/service_catalog_6_1',
    '/6_1/self-service-6_1/my_incidents_6_1': '/6_1/self_service_6_1/my_incidents_6_1',
    '/6_1/self-service-6_1/my_requests_6_1': '/6_1/self_service_6_1/my_requests_6_1',
    
    # Program/Project Management - fix directory name from program-project-management-6_1 to program-project-management_6_1
    '/6_1/program-project-management-6_1/program_dashboard_6_1': '/6_1/program-project-management_6_1/program_dashboard_6_1',
    '/6_1/program-project-management-6_1/project_dashboard_6_1': '/6_1/program-project-management_6_1/project_dashboard_6_1',
    
    # Risk Register - fix directory name from risk-register-6_1 to risk_register_6_1
    '/6_1/risk-register-6_1/risk_dashboard_6_1': '/6_1/risk_register_6_1/risk_dashboard_6_1',
    '/6_1/risk-register-6_1/risks_6_1': '/6_1/risk_register_6_1/risks_6_1',
    
    # ITAM CMDB - sync_logs and tags are in different locations
    # Note: These files don't exist in itam_6_1/cmdb_6_1, they're in other modules
    '/6_1/itam_6_1/cmdb_6_1/sync_logs_6_1': '/6_1/itsm_6_1/config_mngmt/sync_logs_6_1',
    '/6_1/itam_6_1/cmdb_6_1/tags_6_1': '/6_1/admin_6_1/admin_sacm/process_tags_6_1',
}

# Read the index file
print(f"Reading {index_file}...")
with open(index_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Apply fixes - simple string replacement
original_content = content
fix_count = 0

for old_path, new_path in fixes.items():
    if old_path in content:
        content = content.replace(old_path, new_path)
        fix_count += 1
        print(f"Fixed: {old_path} -> {new_path}")

print(f"\nApplied {fix_count} fixes")

# Write the fixed content
if content != original_content:
    backup_file = index_file.with_suffix('.mdx.backup')
    print(f"\nCreating backup: {backup_file}")
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(original_content)
    
    print(f"Writing fixed content to {index_file}...")
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("TOC updated successfully!")
else:
    print("\nNo changes needed - all paths are already correct")

