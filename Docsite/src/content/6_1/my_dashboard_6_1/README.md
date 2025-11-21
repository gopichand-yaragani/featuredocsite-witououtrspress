# My Dashboard Navigation Mapping for Version 6.1

This document shows how the navigation structure maps to MDX files in the Virima documentation system.

## Navigation Structure

```
My Dashboard (module: my-dashboard, section: my-dashboard)
├── Overview (page: my-dashboard-overview) → my-dashboard-overview-6_1.mdx
├── Dashboards (page: dashboards) → dashboards-6_1.mdx
│   ├── Contents (page: dashboards-contents) → dashboards-contents-6_1.mdx
│   ├── Customization (page: customization) → dashboards-customization-6_1.mdx
│   ├── Report Actions (page: report-actions) → dashboards-report-actions-6_1.mdx
│   └── My Dashboard (page: my-dashboard-section) → my-dashboard-6_1.mdx
│       └── Contents (page: my-dashboard-contents) → my-dashboard-contents-6_1.mdx
└── System Icons (page: system-icons) → system-icons-6_1.mdx
```

## File Mapping

| Navigation Path | Page ID | MDX File |
|----------------|---------|----------|
| My Dashboard > Overview | `my-dashboard-overview` | `my-dashboard-overview-6_1.mdx` |
| My Dashboard > Dashboards | `dashboards` | `dashboards-6_1.mdx` |
| My Dashboard > Dashboards > Contents | `dashboards-contents` | `dashboards-contents-6_1.mdx` |
| My Dashboard > Dashboards > Customization | `customization` | `dashboards-customization-6_1.mdx` |
| My Dashboard > Dashboards > Report Actions | `report-actions` | `dashboards-report-actions-6_1.mdx` |
| My Dashboard > Dashboards > My Dashboard | `my-dashboard-section` | `my-dashboard-6_1.mdx` |
| My Dashboard > Dashboards > My Dashboard > Contents | `my-dashboard-contents` | `my-dashboard-contents-6_1.mdx` |
| My Dashboard > System Icons | `system-icons` | `system-icons-6_1.mdx` |

## Implementation Details

### Path Resolution
The file path is resolved using the `resolveMDXPath` utility function in `/utils/mdxPathResolver.ts`:

```typescript
resolveMDXPath({
  version: '6.1',
  module: 'my-dashboard',
  section: 'my-dashboard',
  page: 'dashboards-contents'
})
// Returns: '/content/6_1/my-dashboard/dashboards-contents-6_1.mdx'
```

### MDX Content Loading
The `MDXContent` component (`/components/MDXContent.tsx`) handles:
- Fetching the MDX file content
- Parsing and rendering markdown
- Syntax highlighting for code blocks
- Consistent styling with Tailwind CSS

### Navigation Updates
The navigation structure is defined in `/components/DocumentationLayout.tsx` in the `myDashboardSections` array.

## Adding New Pages

To add a new page to My Dashboard for version 6.1:

1. Create the MDX file in `/content/6_1/my-dashboard/` with naming pattern: `{page-name}-6_1.mdx`
2. Add the navigation entry in `/components/DocumentationLayout.tsx` under `myDashboardSections`
3. Add the file mapping in `/utils/mdxPathResolver.ts` in the `getMyDashboard61Path` function

## Version Support

This mapping is specific to version 6.1. Other versions (5.13, 6.1.1, NextGen) may have different file structures and should be handled separately in the path resolver.
