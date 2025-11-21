# My Dashboard Version 6.1 - Complete Navigation to File Mapping

## Overview

This document provides a complete reference for how the My Dashboard module navigation maps to MDX files for version 6.1 of Virima.

## Visual Navigation Tree

```
📂 My Dashboard Module (version 6.1)
│
├── 📄 Overview
│   └── File: my-dashboard-overview-6_1.mdx
│   └── Path: /content/6_1/my-dashboard/my-dashboard-overview-6_1.mdx
│
├── 📁 Dashboards
│   ├── 📄 (Main page)
│   │   └── File: dashboards-6_1.mdx
│   │   └── Path: /content/6_1/my-dashboard/dashboards-6_1.mdx
│   │
│   ├── 📄 Contents
│   │   └── File: dashboards-contents-6_1.mdx
│   │   └── Path: /content/6_1/my-dashboard/dashboards-contents-6_1.mdx
│   │
│   ├── 📄 Customization
│   │   └── File: dashboards-customization-6_1.mdx
│   │   └── Path: /content/6_1/my-dashboard/dashboards-customization-6_1.mdx
│   │
│   ├── 📄 Report Actions
│   │   └── File: dashboards-report-actions-6_1.mdx
│   │   └── Path: /content/6_1/my-dashboard/dashboards-report-actions-6_1.mdx
│   │
│   └── 📁 My Dashboard
│       ├── 📄 (Main page)
│       │   └── File: my-dashboard-6_1.mdx
│       │   └── Path: /content/6_1/my-dashboard/my-dashboard-6_1.mdx
│       │
│       └── 📄 Contents
│           └── File: my-dashboard-contents-6_1.mdx
│           └── Path: /content/6_1/my-dashboard/my-dashboard-contents-6_1.mdx
│
└── 📄 System Icons
    └── File: system-icons-6_1.mdx
    └── Path: /content/6_1/my-dashboard/system-icons-6_1.mdx
```

## Technical Implementation

### Component Flow

```
User clicks navigation item
        ↓
App.tsx updates state
  - selectedVersion: '6.1'
  - selectedModule: 'my-dashboard'
  - selectedSection: 'my-dashboard'
  - selectedPage: 'dashboards-contents' (example)
        ↓
DocumentationContent.tsx receives props
        ↓
Calls resolveMDXPath() with parameters
        ↓
Returns: '/content/6_1/my-dashboard/dashboards-contents-6_1.mdx'
        ↓
MDXContent component fetches and renders the file
```

### File Naming Convention

For My Dashboard in version 6.1, all files follow this pattern:
```
{topic-name}-6_1.mdx
```

Examples:
- `dashboards-6_1.mdx`
- `dashboards-contents-6_1.mdx`
- `my-dashboard-contents-6_1.mdx`

### Page ID to File Mapping

| Page ID | File Name |
|---------|-----------|
| `my-dashboard-overview` | `my-dashboard-overview-6_1.mdx` |
| `dashboards` | `dashboards-6_1.mdx` |
| `dashboards-contents` | `dashboards-contents-6_1.mdx` |
| `customization` | `dashboards-customization-6_1.mdx` |
| `report-actions` | `dashboards-report-actions-6_1.mdx` |
| `my-dashboard-section` | `my-dashboard-6_1.mdx` |
| `my-dashboard-contents` | `my-dashboard-contents-6_1.mdx` |
| `system-icons` | `system-icons-6_1.mdx` |

## Code References

### 1. Navigation Structure
**File:** `/components/DocumentationLayout.tsx`  
**Lines:** ~182-203  
**Array:** `myDashboardSections`

### 2. Path Resolution
**File:** `/utils/mdxPathResolver.ts`  
**Function:** `getMyDashboard61Path(page: string, section: string)`

### 3. Content Loading
**File:** `/components/MDXContent.tsx`  
**Component:** `MDXContent`

### 4. Content Rendering
**File:** `/components/DocumentationContent.tsx`  
**Function:** `renderContent()`

## Default Page Behavior

When a user clicks on "My Dashboard" module:
- **Section:** `my-dashboard`
- **Page:** `my-dashboard-overview`
- **File:** `my-dashboard-overview-6_1.mdx`

This provides an overview landing page for the My Dashboard module.

## Unique ID System

To handle nested "Contents" pages at different levels, unique page IDs are used:
- `dashboards-contents` - For Contents under Dashboards
- `my-dashboard-contents` - For Contents under My Dashboard (nested)

This prevents ID collision and allows proper file mapping.

## Error Handling

If an MDX file cannot be loaded:
1. MDXContent component shows a user-friendly error message
2. Displays the attempted file path for debugging
3. Shows the specific error details

## Testing Checklist

- [ ] Overview page loads correctly
- [ ] Dashboards main page loads
- [ ] Dashboards > Contents loads correct file
- [ ] Dashboards > Customization loads
- [ ] Dashboards > Report Actions loads
- [ ] Dashboards > My Dashboard loads
- [ ] Dashboards > My Dashboard > Contents loads correct file (not dashboards-contents)
- [ ] System Icons page loads
- [ ] Navigation breadcrumbs show correct path
- [ ] All nested items expand/collapse properly

## Future Enhancements

1. Add breadcrumb click-to-navigate functionality
2. Implement table of contents extraction from MDX headings
3. Add related pages suggestions
4. Implement search within MDX content
5. Add version comparison view
