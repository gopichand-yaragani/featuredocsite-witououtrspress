# Virima Documentation Content

This directory contains all documentation content in MDX format for the Virima documentation website. The content is organized using a **version-first** structure for modern content management, while legacy content remains accessible during migration.

---

## Table of Contents

1. [Directory Structure Overview](#directory-structure-overview)
2. [New Version-First Structure](#new-version-first-structure)
3. [Legacy Structure](#legacy-structure)
4. [Module Folders](#module-folders)
5. [File Path Conventions](#file-path-conventions)
6. [Supported Versions](#supported-versions)
7. [Adding New Content](#adding-new-content)
8. [Content Guidelines](#content-guidelines)
9. [Migration Guide](#migration-guide)
10. [Code Integration](#code-integration)

---

## Directory Structure Overview

The `/content` directory now supports **two organizational structures**:

### **🆕 New Structure (Recommended)** - Version-First
```
/content/{VERSION}/{MODULE}/{PAGE}.mdx
```
✅ All new content should use this structure

### **📦 Legacy Structure** - Module-First  
```
/content/{MODULE}/{SECTION}/{PAGE}-{VERSION}.mdx
```
⚠️ Exists for backward compatibility during migration

---

## New Version-First Structure

### Complete Directory Tree

```
/content/
│
├── NG/                                    # NextGen Version
│   ├── my-dashboard/
│   │   └── system-icons.mdx
│   ├── cmdb/
│   │   └── overview.mdx
│   ├── discovery-scan/
│   │   └── overview.mdx
│   ├── itsm/
│   │   └── overview.mdx
│   ├── vulnerability-management/
│   │   └── overview.mdx
│   ├── itam/
│   │   └── overview.mdx
│   ├── self-service/
│   │   └── overview.mdx
│   ├── program-project-management/
│   │   └── overview.mdx
│   ├── risk-register/
│   │   └── overview.mdx
│   └── reports/
│       └── overview.mdx
│
├── 6_1_1/                                 # Version 6.1.1
│   ├── my-dashboard/
│   │   └── system-icons.mdx
│   ├── cmdb/
│   │   └── overview.mdx
│   ├── discovery-scan/
│   │   └── overview.mdx
│   ├── itsm/
│   │   └── overview.mdx
│   ├── vulnerability-management/
│   │   └── overview.mdx
│   ├── itam/
│   │   └── overview.mdx
│   ├── self-service/
│   │   └── overview.mdx
│   ├── program-project-management/
│   │   └── overview.mdx
│   ├── risk-register/
│   │   └── overview.mdx
│   └── reports/
│       └── overview.mdx
│
├── 6_1/                                   # Version 6.1
│   ├── my-dashboard/
│   │   └── system-icons.mdx
│   ├── cmdb/
│   │   └── overview.mdx
│   ├── discovery-scan/
│   │   └── overview.mdx
│   ├── itsm/
│   │   └── overview.mdx
│   ├── vulnerability-management/
│   │   └── overview.mdx
│   ├── itam/
│   │   └── overview.mdx
│   ├── self-service/
│   │   └── overview.mdx
│   ├── program-project-management/
│   │   └── overview.mdx
│   ├── risk-register/
│   │   └── overview.mdx
│   └── reports/
│       └── overview.mdx
│
└── 5_13/                                  # Version 5.13
    ├── my-dashboard/
    │   └── system-icons.mdx
    ├── cmdb/
    │   └── overview.mdx
    ├── discovery-scan/
    │   └── overview.mdx
    ├── itsm/
    │   └── overview.mdx
    ├── vulnerability-management/
    │   └── overview.mdx
    ├── itam/
    │   └── overview.mdx
    ├── self-service/
    │   └── overview.mdx
    ├── program-project-management/
    │   └── overview.mdx
    ├── risk-register/
    │   └── overview.mdx
    └── reports/
        └── overview.mdx
```

### Benefits of Version-First Structure

| Benefit | Description |
|---------|-------------|
| **Version Management** | All content for a specific version is in one place |
| **Easy Comparison** | Compare same topic across versions by looking at parallel folders |
| **Clean File Names** | No version suffixes needed (e.g., `system-icons.mdx` vs `system-icons-NG.mdx`) |
| **Scalable** | Add new versions by copying entire version folder |
| **Human-Readable** | Intuitive navigation: Version → Module → Topic |
| **Version Isolation** | Changes to one version don't affect others |
| **Bulk Operations** | Easy to update/delete all content for a specific version |

---

## Legacy Structure

The legacy structure is maintained for backward compatibility during migration:

```
/content/
├── my-dashboard/
│   ├── getting-started/
│   │   ├── system-icons-5.13.mdx
│   │   ├── advanced-search-5.13.mdx
│   │   ├── attachments-5.13.mdx
│   │   └── ...
│   ├── online-help/
│   │   └── overview-5.13.mdx
│   ├── release-notes/
│   │   └── latest-release-5.13.mdx
│   ├── manuals/
│   │   └── user-guide-5.13.mdx
│   ├── api-integration/
│   │   └── api-overview-5.13.mdx
│   └── compatibility-matrix/
│       └── system-requirements-5.13.mdx
│
├── cmdb/
│   ├── getting-started/
│   ├── online-help/
│   └── ...
│
├── discovery-scan/
├── itsm/
├── vulnerability-management/
├── itam/
├── self-service/
├── program-project-management/
├── risk-register/
└── reports/
```

### Legacy Path Format
```
/content/{MODULE}/{SECTION}/{PAGE}-{VERSION}.mdx
```

**Examples:**
- `/content/my-dashboard/getting-started/system-icons-5.13.mdx`
- `/content/cmdb/online-help/overview-5.13.mdx`
- `/content/itsm/api-integration/api-overview-NG.mdx`

⚠️ **Note:** New content should use the version-first structure. Legacy content will be migrated gradually.

---

## Module Folders

All 10 Virima modules are organized as folders within each version:

| # | Folder Name | Module Name | Description |
|---|-------------|-------------|-------------|
| 1 | `my-dashboard` | My Dashboard | User's personalized dashboard and system icons |
| 2 | `cmdb` | CMDB | Configuration Management Database - CI management and relationships |
| 3 | `discovery-scan` | Discovery Scan | Network and asset discovery capabilities |
| 4 | `itsm` | ITSM | IT Service Management - Incidents, problems, changes, requests |
| 5 | `vulnerability-management` | Vulnerability Management | Security scanning and vulnerability remediation |
| 6 | `itam` | ITAM | IT Asset Management - Hardware and software asset tracking |
| 7 | `self-service` | Self Service | Self Service Portal - End-user service catalog |
| 8 | `program-project-management` | Program & Project Mgmt | Project planning, tracking, and portfolio management |
| 9 | `risk-register` | Risk Register | Risk identification, assessment, and mitigation |
| 10 | `reports` | Reports | Reports, analytics, and dashboards |

### Module Folder Naming Convention

- **Use kebab-case**: All lowercase with hyphens
- **Be descriptive**: Clear indication of module purpose
- **Consistent across versions**: Same folder name in all version folders

---

## File Path Conventions

### New Structure Path Format

```
/content/{VERSION}/{MODULE}/{PAGE}.mdx
```

**Path Components:**

| Component | Format | Example | Notes |
|-----------|--------|---------|-------|
| `{VERSION}` | Underscore-separated | `NG`, `6_1_1`, `6_1`, `5_13` | Version folder name |
| `{MODULE}` | kebab-case | `my-dashboard`, `cmdb`, `discovery-scan` | Module folder name |
| `{PAGE}` | kebab-case | `system-icons`, `overview`, `user-guide` | Topic/page name |

**Real Examples:**
```
✅ /content/NG/my-dashboard/system-icons.mdx
✅ /content/5_13/cmdb/overview.mdx
✅ /content/6_1/itsm/incident-management.mdx
✅ /content/6_1_1/reports/custom-reports.mdx
```

### Legacy Structure Path Format

```
/content/{MODULE}/{SECTION}/{PAGE}-{VERSION}.mdx
```

**Path Components:**

| Component | Format | Example | Notes |
|-----------|--------|---------|-------|
| `{MODULE}` | kebab-case | `my-dashboard`, `cmdb` | Module folder |
| `{SECTION}` | kebab-case | `getting-started`, `online-help` | Section/deliverable folder |
| `{PAGE}` | kebab-case | `system-icons`, `quick-start` | Topic name |
| `{VERSION}` | Dot or hyphen-separated | `NG`, `6.1.1`, `6.1`, `5.13` | Version suffix |

**Real Examples:**
```
📦 /content/my-dashboard/getting-started/system-icons-5.13.mdx
📦 /content/cmdb/online-help/overview-5.13.mdx
📦 /content/itsm/manuals/user-guide-NG.mdx
```

---

## Supported Versions

| Version Code | Full Name | Status | Notes |
|--------------|-----------|--------|-------|
| **NG** | NextGen | Latest | Includes AI-powered features |
| **6_1_1** | 6.1.1 | Stable | Patch release |
| **6_1** | 6.1 | Stable | Major release |
| **5_13** | 5.13 | Legacy | Previous stable version |

### Version Folder Naming

- Use **underscores** for version numbers: `5_13`, `6_1`, `6_1_1`
- Use **NG** for NextGen (no version number)
- Keep version names short and consistent

---

## Adding New Content

### Option 1: Add a New Topic to Existing Module

**Steps:**

1. Navigate to the appropriate version and module folder:
   ```
   /content/{VERSION}/{MODULE}/
   ```

2. Create a new `.mdx` file with a descriptive name:
   ```
   {topic-name}.mdx
   ```

3. Add your content following the content structure guidelines

**Example:** Adding "Incident Management" to ITSM for all versions

```bash
# Create files for all versions
/content/NG/itsm/incident-management.mdx
/content/6_1_1/itsm/incident-management.mdx
/content/6_1/itsm/incident-management.mdx
/content/5_13/itsm/incident-management.mdx
```

### Option 2: Add a New Module

**Steps:**

1. Create module folder in each version directory:
   ```bash
   /content/NG/{new-module}/
   /content/6_1_1/{new-module}/
   /content/6_1/{new-module}/
   /content/5_13/{new-module}/
   ```

2. Add topic files to each module folder

3. Update navigation in `/components/DocumentationLayout.tsx`:
   - Add module to `moduleNames` object
   - Add module to navigation structure

**Example:** Adding "Contract Management" module

```typescript
// In DocumentationLayout.tsx
const moduleNames: Record<string, string> = {
  // ... existing modules
  "contract-management": "Contract Management",
};
```

### Option 3: Add a New Version

**Steps:**

1. Copy an existing version folder:
   ```bash
   # Copy structure from latest version
   cp -r /content/NG /content/{NEW_VERSION}
   ```

2. Update version information in all copied files:
   - Change version number in content
   - Update version-specific features/screenshots
   - Modify any version-dependent information

3. Update code references:
   - Add version to version selector
   - Update version constants if needed

**Example:** Adding version 7.0

```bash
# Create new version folder
mkdir /content/7_0

# Copy structure from NG
cp -r /content/NG/* /content/7_0/

# Update all files in 7_0 with new version info
```

---

## Content Guidelines

### File Naming Conventions

✅ **Do:**
- Use **kebab-case**: `incident-management.mdx`, `user-preferences.mdx`
- Be **descriptive**: `configure-email-notifications.mdx` not `email.mdx`
- Keep it **concise**: Avoid overly long names
- Use **nouns**: `system-icons.mdx`, not `viewing-icons.mdx`
- Match **navigation labels**: File name should align with menu item

❌ **Don't:**
- Use spaces: `incident management.mdx`
- Use camelCase: `incidentManagement.mdx`
- Add version suffixes: `overview-NG.mdx` (version is in folder)
- Use special characters: `user_preferences.mdx`, `overview@v2.mdx`

### Content Structure Template

Every MDX file should follow this structure:

```mdx
# Page Title

Brief introduction paragraph explaining what this page covers.

## Overview

Main overview section with key information about the topic.

## Key Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Getting Started

Step-by-step instructions for common tasks:

1. First step
2. Second step
3. Third step

## Common Use Cases

### Use Case 1
Description and instructions...

### Use Case 2
Description and instructions...

## Best Practices

1. **Best Practice 1**: Explanation
2. **Best Practice 2**: Explanation
3. **Best Practice 3**: Explanation

## Troubleshooting

### Issue 1
**Problem:** Description
**Solution:** Steps to resolve

### Issue 2
**Problem:** Description
**Solution:** Steps to resolve

## Related Topics

- [Link to related topic 1](#)
- [Link to related topic 2](#)
- [Link to related topic 3](#)

## Version Information

This documentation applies to Virima version **{VERSION}**.
```

### MDX Format Features

MDX files support both Markdown and JSX:

```mdx
# Standard Markdown

You can use all standard Markdown features:

- **Bold text**
- *Italic text*
- `Code snippets`
- [Links](https://example.com)
- Images: ![Alt text](image-url)

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |

## Code Blocks

```javascript
const example = "code block";
console.log(example);
```

## Alerts (if supported)

> **Note:** This is an important note

> **Warning:** This is a warning message

> **Tip:** This is a helpful tip
```

### Content Best Practices

#### Writing Style
- **Clear and concise**: Use simple, direct language
- **Active voice**: "Click the button" not "The button should be clicked"
- **Consistent terminology**: Use the same terms throughout
- **Scannable**: Use headings, lists, and short paragraphs

#### Structure
- **Logical flow**: Organize from general to specific
- **Consistent headings**: Use H2 for main sections, H3 for subsections
- **One concept per section**: Don't mix unrelated topics

#### Technical Details
- **Include examples**: Show code snippets, screenshots, or examples
- **Step-by-step instructions**: Number steps for procedures
- **Prerequisites**: List what users need before starting
- **Expected results**: Describe what should happen

#### Version-Specific Content
- **Note differences**: Clearly mark version-specific features
- **Include version info**: Always state which version the docs apply to
- **Update all versions**: When adding content, consider if it applies to other versions

#### Cross-References
- **Link related topics**: Help users discover related content
- **Use descriptive link text**: "Learn about CI relationships" not "Click here"
- **Check links work**: Verify links point to existing content

---

## Migration Guide

### Migrating from Legacy to New Structure

Follow these steps to migrate content from the old structure to the new structure:

#### Step 1: Identify Content to Migrate

Legacy path example:
```
/content/my-dashboard/getting-started/system-icons-5.13.mdx
```

New path:
```
/content/5_13/my-dashboard/system-icons.mdx
```

#### Step 2: Create New File Location

1. Navigate to: `/content/{VERSION}/{MODULE}/`
2. If module folder doesn't exist, create it
3. Create the new `.mdx` file with simplified name (remove version suffix)

#### Step 3: Copy and Update Content

1. Copy content from legacy file to new file
2. Remove version suffix from filename
3. Verify version information in content is correct
4. Test that content renders properly

#### Step 4: Update References

1. Update any internal links pointing to the old path
2. Update navigation if needed
3. Update any code references

#### Step 5: Verify and Clean Up

1. Test the new file in the application
2. Verify all links and images work
3. Consider keeping legacy file temporarily for backward compatibility
4. Eventually delete legacy file once migration is complete

### Migration Mapping

| Legacy Path | New Path |
|-------------|----------|
| `/content/my-dashboard/getting-started/system-icons-5.13.mdx` | `/content/5_13/my-dashboard/system-icons.mdx` |
| `/content/cmdb/online-help/overview-NG.mdx` | `/content/NG/cmdb/overview.mdx` |
| `/content/itsm/manuals/user-guide-6.1.mdx` | `/content/6_1/itsm/user-guide.mdx` |

### Migration Status

✅ **Completed:**
- Version-first folder structure created for all 4 versions (NG, 6_1_1, 6_1, 5_13)
- All 10 module folders created in each version
- System Icons content migrated to all versions
- Module overview pages created for all modules in all versions
- Code updated to support new path structure

📋 **In Progress:**
- Migrating legacy deliverable content (getting-started, online-help, etc.)
- Migrating module-specific detailed topics
- Updating internal cross-references

🔜 **Pending:**
- Complete migration of all legacy content
- Deprecate/remove legacy folder structure
- Update all navigation references
- Create redirects for old paths (if needed)

---

## Code Integration

### How Content is Loaded

The application loads content using the new path structure:

```typescript
// In DocumentationContent.tsx
const contentPath = `/content/${version}/${module}/${page}.mdx`;
```

**Path Variables:**
- `version`: Selected version (NG, 6_1_1, 6_1, 5_13)
- `module`: Selected module (my-dashboard, cmdb, etc.)
- `page`: Selected page/topic (system-icons, overview, etc.)

### Module Name Mapping

Module folder names are mapped to display names:

```typescript
// In DocumentationContent.tsx
const moduleNames: Record<string, string> = {
  "my-dashboard": "My Dashboard",
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
```

### Navigation Structure

Navigation is defined in `DocumentationLayout.tsx` and follows the folder structure.

---

## Quick Reference

### File Organization Checklist

- [ ] Content is in correct version folder (`/content/{VERSION}/`)
- [ ] Module folder name uses kebab-case
- [ ] File name uses kebab-case (no version suffix)
- [ ] File has `.mdx` extension
- [ ] Content follows standard structure template
- [ ] Version information is included at the end
- [ ] Internal links are tested and working
- [ ] Images/assets are properly referenced

### Common Operations

**Add new topic to all versions:**
```bash
# Create the same topic in all 4 versions
/content/NG/{module}/{topic-name}.mdx
/content/6_1_1/{module}/{topic-name}.mdx
/content/6_1/{module}/{topic-name}.mdx
/content/5_13/{module}/{topic-name}.mdx
```

**Compare topic across versions:**
```bash
# Open same topic from different versions
/content/NG/{module}/{topic-name}.mdx
/content/6_1_1/{module}/{topic-name}.mdx
/content/6_1/{module}/{topic-name}.mdx
/content/5_13/{module}/{topic-name}.mdx
```

**Bulk update a module:**
```bash
# All files for a module in one version
/content/{VERSION}/{module}/*.mdx
```

---

## Support and Questions

For questions about content organization or migration:
1. Review this README
2. Check `/content/FOLDER_STRUCTURE.md` for detailed structure reference
3. Refer to `/guidelines/Guidelines.md` for design and style guidelines
4. Contact the documentation team

---

**Last Updated:** November 11, 2025  
**Structure Version:** 2.0 (Version-First)
