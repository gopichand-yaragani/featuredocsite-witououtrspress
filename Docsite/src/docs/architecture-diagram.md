# Architecture Diagram - MDX File Loading System

## System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  App.tsx - Main Application State                                   │
│  • selectedVersion: '6.1'                                            │
│  • selectedModule: 'my-dashboard'                                    │
│  • selectedSection: 'my-dashboard'                                   │
│  • selectedPage: 'dashboards-contents'                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  DocumentationLayout.tsx     │  │  DocumentationContent.tsx    │
│  • Sidebar Navigation        │  │  • Content Display Area      │
│  • Module Selector           │  │  • Breadcrumbs               │
│  • Version Selector          │  │  • Table of Contents         │
└──────────────────────────────┘  └──────────────────────────────┘
                                                    │
                                                    ▼
                                  ┌──────────────────────────────┐
                                  │  renderContent()             │
                                  │  • Checks for MDX file first │
                                  └──────────────────────────────┘
                                                    │
                                                    ▼
                                  ┌──────────────────────────────┐
                                  │  mdxPathResolver.ts          │
                                  │  resolveMDXPath()            │
                                  │  • Input: version, module,   │
                                  │    section, page             │
                                  │  • Output: file path         │
                                  └──────────────────────────────┘
                                                    │
                                                    ▼
                    ┌──────────────────────────────────────────┐
                    │ Returns: '/content/6_1/my-dashboard/     │
                    │           dashboards-contents-6_1.mdx'   │
                    └──────────────────────────────────────────┘
                                                    │
                                                    ▼
                                  ┌──────────────────────────────┐
                                  │  MDXContent.tsx              │
                                  │  • Receives file path        │
                                  └──────────────────────────────┘
                                                    │
                                                    ▼
                                  ┌──────────────────────────────┐
                                  │  contentLoader.ts            │
                                  │  getContent(filePath)        │
                                  │  • Looks up in contentMap    │
                                  └──────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┴────────────────────────┐
                    │                                                        │
                    ▼                                                        ▼
┌─────────────────────────────┐                        ┌──────────────────────┐
│  CONTENT FOUND              │                        │  CONTENT NOT FOUND   │
│  Returns MDX string         │                        │  Returns null        │
└─────────────────────────────┘                        └──────────────────────┘
                    │                                                        │
                    ▼                                                        ▼
┌─────────────────────────────┐                        ┌──────────────────────┐
│  react-markdown             │                        │  Error Message       │
│  • Parses markdown          │                        │  • Amber warning     │
│  • Applies custom styles    │                        │  • Shows file path   │
│  • Syntax highlighting      │                        │  • User-friendly     │
└─────────────────────────────┘                        └──────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RENDERED CONTENT                                │
│  • Properly styled markdown                                          │
│  • Emerald brand colors                                              │
│  • Dark slate text                                                   │
│  • Syntax-highlighted code                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Content Loader Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  contentLoader.ts - Static Import System                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Import Stage (Build Time):                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ import dashboards from './6_1/my-dashboard/               │    │
│  │        dashboards-6_1.mdx?raw'                             │    │
│  │                                                             │    │
│  │ import dashboardsContents from './6_1/my-dashboard/        │    │
│  │        dashboards-contents-6_1.mdx?raw'                    │    │
│  │                                                             │    │
│  │ ... (8 files total)                                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                          │
│                           ▼                                          │
│  Content Map (Runtime):                                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ {                                                           │    │
│  │   '/content/6_1/my-dashboard/dashboards-6_1.mdx':         │    │
│  │      '[MDX content string]',                               │    │
│  │                                                             │    │
│  │   '/content/6_1/my-dashboard/dashboards-contents-6_1.mdx': │    │
│  │      '[MDX content string]',                               │    │
│  │                                                             │    │
│  │   ... (8 entries total)                                    │    │
│  │ }                                                           │    │
│  └────────────────────────────────────────────────────────────┘    │
│                           │                                          │
│                           ▼                                          │
│  Export Functions:                                                   │
│  • getContent(path) → returns content or null                       │
│  • hasContent(path) → returns boolean                               │
│  • getAvailablePaths() → returns array of paths                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Navigation to File Mapping

```
User clicks navigation item
         │
         ▼
┌────────────────────────────────────────────────────┐
│  Navigation Structure (DocumentationLayout.tsx)    │
├────────────────────────────────────────────────────┤
│  My Dashboard (section)                            │
│  ├─ Overview (page: my-dashboard-overview)         │
│  ├─ Dashboards (page: dashboards)                  │
│  │  ├─ Contents (page: dashboards-contents)        │
│  │  ├─ Customization (page: customization)         │
│  │  ├─ Report Actions (page: report-actions)       │
│  │  └─ My Dashboard (page: my-dashboard-section)   │
│  │     └─ Contents (page: my-dashboard-contents)   │
│  └─ System Icons (page: system-icons)              │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│  Path Resolution (mdxPathResolver.ts)              │
├────────────────────────────────────────────────────┤
│  getMyDashboard61Path(page, section)               │
│  │                                                  │
│  └─ Lookup in fileMap:                             │
│     {                                               │
│       'dashboards': 'dashboards-6_1.mdx',          │
│       'dashboards-contents':                        │
│          'dashboards-contents-6_1.mdx',            │
│       'customization':                              │
│          'dashboards-customization-6_1.mdx',       │
│       ...                                           │
│     }                                               │
│  │                                                  │
│  └─ Returns: '/content/6_1/my-dashboard/          │
│               {filename}.mdx'                       │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│  Content Loading (contentLoader.ts)                │
├────────────────────────────────────────────────────┤
│  getContent(filePath)                              │
│  │                                                  │
│  └─ Looks up in contentMap                         │
│     Returns: MDX content string                    │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│  Rendering (MDXContent.tsx)                        │
├────────────────────────────────────────────────────┤
│  ReactMarkdown                                     │
│  • Custom component mapping                        │
│  • Tailwind styling                                │
│  • Syntax highlighting                             │
└────────────────────────────────────────────────────┘
```

## Data Flow Example

**User Action**: Clicks "Dashboards > Contents" in version 6.1

```
1. Navigation Click
   └─> onPageChange('dashboards-contents')

2. App State Update
   └─> selectedPage = 'dashboards-contents'
   └─> selectedSection = 'my-dashboard'
   └─> selectedModule = 'my-dashboard'
   └─> selectedVersion = '6.1'

3. DocumentationContent Renders
   └─> renderContent() called

4. Path Resolution
   └─> resolveMDXPath({
         version: '6.1',
         module: 'my-dashboard',
         section: 'my-dashboard',
         page: 'dashboards-contents'
       })
   └─> Returns: '/content/6_1/my-dashboard/dashboards-contents-6_1.mdx'

5. MDXContent Component
   └─> <MDXContent filePath="/content/6_1/my-dashboard/dashboards-contents-6_1.mdx" />

6. Content Loading
   └─> getContent('/content/6_1/my-dashboard/dashboards-contents-6_1.mdx')
   └─> Returns: "# Dashboards Contents\n\n..."

7. Markdown Rendering
   └─> ReactMarkdown parses and renders
   └─> Custom styles applied
   └─> Content displayed to user
```

## Component Dependencies

```
App.tsx
  │
  ├─> DocumentationLayout.tsx
  │     └─> Navigation UI
  │
  └─> DocumentationContent.tsx
        │
        ├─> Imports mdxPathResolver
        │     └─> resolveMDXPath()
        │
        └─> MDXContent.tsx
              │
              ├─> Imports contentLoader
              │     └─> getContent()
              │
              └─> ReactMarkdown
                    └─> Renders content
```

## File Organization

```
/
├── components/
│   ├── MDXContent.tsx           (Renders MDX content)
│   ├── DocumentationContent.tsx (Main content area)
│   └── DocumentationLayout.tsx  (Navigation & layout)
│
├── utils/
│   └── mdxPathResolver.ts       (Path resolution logic)
│
├── content/
│   ├── contentLoader.ts         (Static imports & mapping)
│   └── 6_1/
│       └── my-dashboard/
│           ├── dashboards-6_1.mdx
│           ├── dashboards-contents-6_1.mdx
│           ├── dashboards-customization-6_1.mdx
│           ├── dashboards-report-actions-6_1.mdx
│           ├── my-dashboard-6_1.mdx
│           ├── my-dashboard-contents-6_1.mdx
│           ├── my-dashboard-overview-6_1.mdx
│           └── system-icons-6_1.mdx
│
└── docs/
    └── (Documentation files)
```
